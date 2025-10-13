// src/components/Toast.tsx
'use client'
import { useEffect } from 'react'

type ToastProps = { id: string; type?: 'success'|'error'; message: string; onClose?: ()=>void }

export default function Toast({ id, type='success', message, onClose }: ToastProps){
  useEffect(()=>{
    const t = setTimeout(()=> onClose && onClose(), 3800)
    return ()=> clearTimeout(t)
  },[])

  return (
    <div className={`toast ${type === 'success' ? 'success' : 'error'}`} role="status" aria-live="polite">
      <div style={{width:12}}>{/* icon placeholder */}</div>
      <div className="text-sm">{message}</div>
      <div style={{marginLeft:'auto', marginRight:0}}></div>
    </div>
  )
}
