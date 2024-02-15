export const onError = (error: unknown) =>
  alert(error instanceof Error ? error.message : String(error))