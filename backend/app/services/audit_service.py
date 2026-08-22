from typing import Any
from sqlalchemy.orm import Session

from app.models import AuditLog


def record_audit(
    db: Session,
    actor_id: int | None,
    action: str,
    target_table: str | None = None,
    target_id: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditLog:
    """Write an unbypassable structured record of a sensitive operation."""
    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        target_table=target_table,
        target_id=target_id,
        metadata_payload=metadata or {},
    )
    db.add(entry)
    return entry
