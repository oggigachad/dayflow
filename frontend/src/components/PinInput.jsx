import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

const PinContext = createContext(null)

export function PinInputRoot({ children, value: controlledValue, onValueChange, onValueComplete, length = 4, className = '' }) {
  const [internalValue, setInternalValue] = useState(['', '', '', ''])
  const inputRefs = useRef([])

  const values = controlledValue !== undefined ? controlledValue : internalValue

  const setDigit = (index, digit) => {
    const next = [...values]
    next[index] = digit
    if (controlledValue === undefined) {
      setInternalValue(next)
    }
    if (onValueChange) {
      onValueChange(next)
    }

    const joined = next.join('')
    if (joined.length === length && onValueComplete) {
      onValueComplete({ value: next, valueAsString: joined })
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        setDigit(index, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleChange = (index, e) => {
    const val = e.target.value
    if (!val) {
      setDigit(index, '')
      return
    }

    // Handle paste or single char
    const cleanDigits = val.replace(/\D/g, '')
    if (cleanDigits.length > 1) {
      const next = [...values]
      for (let i = 0; i < cleanDigits.length && index + i < length; i++) {
        next[index + i] = cleanDigits[i]
      }
      if (controlledValue === undefined) {
        setInternalValue(next)
      }
      if (onValueChange) onValueChange(next)
      const nextFocus = Math.min(index + cleanDigits.length, length - 1)
      inputRefs.current[nextFocus]?.focus()
      
      const joined = next.join('')
      if (joined.length === length && onValueComplete) {
        onValueComplete({ value: next, valueAsString: joined })
      }
      return
    }

    const singleDigit = cleanDigits.slice(-1)
    setDigit(index, singleDigit)
    if (singleDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  return (
    <PinContext.Provider value={{ values, length, inputRefs, handleChange, handleKeyDown }}>
      <div className={`pin-input-root ${className}`}>
        {children}
      </div>
    </PinContext.Provider>
  )
}

export function PinInputLabel({ children, className = '' }) {
  return (
    <label className={`pin-input-label ${className}`}>
      {children}
    </label>
  )
}

export function PinInputControl({ children, className = '' }) {
  return (
    <div className={`pin-input-control ${className}`}>
      {children}
    </div>
  )
}

export function PinInputField({ index, className = '', autoFocus = false }) {
  const { values, inputRefs, handleChange, handleKeyDown } = useContext(PinContext)

  useEffect(() => {
    if (autoFocus && index === 0) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus, index, inputRefs])

  return (
    <input
      ref={(el) => (inputRefs.current[index] = el)}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={4}
      value={values[index] || ''}
      onChange={(e) => handleChange(index, e)}
      onKeyDown={(e) => handleKeyDown(index, e)}
      className={`pin-input-field ${className}`}
      autoComplete="one-time-code"
    />
  )
}

export function PinInputHiddenInput() {
  const { values } = useContext(PinContext)
  return <input type="hidden" name="pin" value={values.join('')} />
}

export const PinInput = {
  Root: PinInputRoot,
  Label: PinInputLabel,
  Control: PinInputControl,
  Input: PinInputField,
  HiddenInput: PinInputHiddenInput,
}

export default PinInput
