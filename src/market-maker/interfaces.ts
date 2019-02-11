export interface IStrategy {
  execute: { () };
  shouldExecute: { () };
}
