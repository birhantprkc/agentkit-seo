export class McpProtocolError extends Error {
  constructor(code, message, data = undefined) {
    super(message);
    this.name = "McpProtocolError";
    this.code = code;
    this.data = data;
  }
}

export function invalidParams(message, data = undefined) {
  return new McpProtocolError(-32602, message, data);
}

export function resourceNotFound(uri, message = "Resource not found") {
  return new McpProtocolError(-32002, message, { uri });
}
