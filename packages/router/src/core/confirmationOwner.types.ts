export interface ConfirmationOwner {
  begin: () => () => boolean;
  invalidate: VoidFunction;
}
