/**
 * 统一的业务异常。
 * service 抛出，controller 包装后交给 errorHandlerMiddleware 落错误码。
 */
export class BusinessError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "BusinessError";
    this.code = code;
    this.status = status;
  }
}
