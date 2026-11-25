"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Submits a form to a useActionState dispatcher WITHOUT React 19's automatic reset.
 * With `<form action>`, React clears every field after the action, even when the server
 * answered with validation errors, so the manager would have to retype everything.
 * Forms that should clear after a success reset themselves explicitly.
 */
export function submitKeepingValues(dispatch: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(formData));
  };
}
