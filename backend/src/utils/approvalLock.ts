/**
 * 审批串行锁。
 * 两个调度员同时点击「审批」时，请求在此排队依次进入临界区；
 * 后一个进入时读到的已是前一个提交的最新数据，因此只会有一份成功。
 */
let tail: Promise<unknown> = Promise.resolve();

export function withApprovalLock<T>(critical: () => Promise<T> | T): Promise<T> {
  const next = tail.then(critical, critical);
  // 不让前一个调用的结果中断排队链本身
  tail = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}
