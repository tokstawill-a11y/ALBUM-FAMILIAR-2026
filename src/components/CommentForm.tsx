"use client";

import { useActionState, useRef, useEffect } from "react";
import { addCommentAction } from "@/actions/comment";

export default function CommentForm({ mediaId }: { mediaId: string }) {
  const [state, formAction, isPending] = useActionState(addCommentAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input type="hidden" name="mediaId" value={mediaId} />
      
      {state?.error && (
        <div style={{ color: "var(--error)", fontSize: "0.85rem" }}>
          {state.error}
        </div>
      )}
      
      <div style={{ display: "flex", gap: "1rem" }}>
        <input 
          type="text" 
          name="text" 
          required 
          placeholder="Añade un comentario..." 
          style={{ flex: 1, borderRadius: "var(--radius-full)" }} 
        />
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Enviando..." : "Comentar"}
        </button>
      </div>
    </form>
  )
}
