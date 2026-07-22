// ============================================================
// CASHBOT - Déclarations de types globales
// ============================================================

// Pour les imports CSS
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Pour les imports d'images
declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}