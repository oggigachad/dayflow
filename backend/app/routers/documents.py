from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Document, Role, User
from app.schemas import DocumentCreate, DocumentOut

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/me", response_model=list[DocumentOut])
def get_my_documents(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Document]:
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )


@router.get("/{user_id}", response_model=list[DocumentOut])
def get_employee_documents(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Document]:
    if current_user.role != Role.admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another employee's documents",
        )
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    payload: DocumentCreate,
    user_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Document:
    target_user_id = current_user.id
    if user_id is not None:
        if current_user.role != Role.admin and user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can upload documents for other employees",
            )
        target_user_id = user_id

    # Check permissions for regular employee
    if current_user.role != Role.admin and payload.document_type not in (
        "Resume",
        "ID Documents",
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Employees cannot upload {payload.document_type} directly",
        )

    # Upsert / replace existing doc of same type
    existing = (
        db.query(Document)
        .filter(
            Document.user_id == target_user_id,
            Document.document_type == payload.document_type,
        )
        .first()
    )
    if existing:
        existing.file_name = payload.file_name
        existing.file_size = payload.file_size
        db.commit()
        db.refresh(existing)
        return existing

    doc = Document(
        user_id=target_user_id,
        document_type=payload.document_type,
        file_name=payload.file_name,
        file_size=payload.file_size,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if current_user.role != Role.admin and doc.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    db.delete(doc)
    db.commit()
