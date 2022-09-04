export class DirectiveError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "DirectiveError"
  }
}

export class ModifierError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "ModifierError"
  }
}
