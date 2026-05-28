import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesAware {
  hasPendingChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesAware> = (component) => {
  if (!component?.hasPendingChanges || !component.hasPendingChanges()) {
    return true;
  }
  return confirm('You have unsaved changes. Leave this page anyway?');
};
