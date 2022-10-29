/** creates string representation of the value passed to it */
export default function intoCode(code: any) {
  if (typeof code === "string") {
    return JSON.stringify(code);
  } else if (typeof code === "object" && code) {
    return JSON.stringify(code).replace(/"([^"]+)":/g, "$1:");
  } else if (typeof code === "function") {
    return code.toString();
  }
}
