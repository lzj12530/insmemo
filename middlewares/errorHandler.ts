import { Context, Next } from "koa";
import { DB } from "../helpers/DBHelper";
import { getErrorInfo } from "../helpers/Error";

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    // 先简单处理数据库连接态丢失的问题
    if (!(await DB.checkStatus())) {
      await DB.connectToMySQL();
      error = {
        message: "数据库连接丢失",
      };
    }

    const errorInfo = getErrorInfo(error.message);

    ctx.status = errorInfo.statusCode;
    ctx.body = {
      succeed: false,
      status: errorInfo.statusCode ?? 500,
      message: `${errorInfo.message}`,
      data: null,
    };
    console.error("Error handler:", error.message, errorInfo);
  }
}
