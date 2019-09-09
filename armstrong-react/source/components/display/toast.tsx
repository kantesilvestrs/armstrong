// TODO: Butter

import * as React from "react";
import { Icon } from "../../";

export interface IToastNotification {
  title?: string;
  message?: string;

  /** will be put into the toast notification as a data attribute, used to style different types of notifications IE alert / error */
  type: ToastType;

  /** amount of time for the notification to autodismiss - will not autodismiss if left undefined */
  autodismiss?: number;

  /** whether to allow the user to manually dismiss the toast with a close button rendered at the top right - defaults to true */
  allowManualDismiss?: boolean;

  /** jsx to render inside the toast notification - can optionally pass down a function to dismiss the notification */
  content?: ((dismiss: () => void) => JSX.Element) | JSX.Element;

  /** unix timestamp of when the notification is dispatched, will default to current time but can be overriden  */
  timestamp?: number;
}

export type DispatchToast = (toast: IToastNotification) => void;
export type DismissToast = (index: number) => void;
export type ToastLocation =
  | "top left"
  | "top right"
  | "bottom left"
  | "bottom right";
export type ToastType = "info" | "success" | "warning" | "error";

export interface IGlobalToastSettings {
  /** Area of the screen for toasts to render in */
  location?: ToastLocation;

  /** jsx to render as a dismiss button on each toast - an icomoon cross by default */
  dismissButton?: JSX.Element;

  /** Amount of time in ms for a toast to dismiss - used to transition toasts out  */
  dismissTime?: number;

  /** If true, hovering over a notification will cancel autodismiss until the cursor leaves again - true by default */
  disableAutodismissOnHover?: boolean;

  /** Render notifications in the provider component, disable if you want to manually render notifications if you don't want the default Armstrong notifications and want to consume the toasts context yourself - true by default */
  renderInProvider?: boolean;
}

/// PROVIDER

interface IToastContext {
  dispatch: DispatchToast;
  dismiss: DismissToast;
  dismissAll: () => void;
  toasts: IToastNotification[];
}

const ToastContext = React.createContext<IToastContext>(undefined);

/** Provides all children with the ToastContext, allowing for use of the useToast hook, and also renders toast notifications */

export const ToastProvider: React.FC<IGlobalToastSettings> = ({
  children,
  renderInProvider,
  ...settings
}) => {
  const [toasts, setToasts] = React.useState<IToastNotification[]>([]);

  /** Dispatch a new toast notification */

  const dispatch = React.useCallback(
    (newToast: IToastNotification) => {
      setToasts([...toasts, newToast]);
    },
    [toasts],
  );

  /** Dismiss a toast notification by index */

  const dismiss = React.useCallback(
    (index: number) => {
      const newToasts = [...toasts];
      newToasts.splice(index, 1);
      setToasts(newToasts);
    },
    [toasts],
  );

  /** Dismiss all toast notifications */

  const dismissAll = React.useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ dispatch, dismiss, dismissAll, toasts }}>
      {children}

      {renderInProvider && !!toasts.length && (
        <ToastContainer
          settings={settings}
          toasts={toasts}
          dismissToast={dismiss}
        />
      )}
    </ToastContext.Provider>
  );
};

ToastProvider.defaultProps = {
  location: "top right",
  dismissButton: <Icon icon={Icon.Icomoon.cross} />,
  dismissTime: 500,
  disableAutodismissOnHover: true,
  renderInProvider: true,
};

/// TOAST HOOK

interface IUseToastReturn {
  /** dispatch a toast notification */
  dispatch: DispatchToast;

  /** dimiss a toast notification by its index */
  dismiss: DismissToast;

  /** dimiss all toast notifications */
  dismissAll: () => void;

  /** all the current toast notifications - use if they are to be rendered elsewhere */
  toasts: IToastNotification[];
}

/** Use toast notifications — returns a method that dispatches a toast notification to the ToastContext, which renders it in the ToastProvider component, as well as methods to dismiss notifications */

export const useToast = (): IUseToastReturn => {
  const context = React.useContext(ToastContext);

  if (!context) {
    // tslint:disable-next-line: no-console
    console.error(
      "You are trying to use a useToast hook outside a ToastProvider, this will not work.",
    );

    return;
  }

  const { dismiss, dismissAll, toasts } = context;

  const dispatch = (toast: IToastNotification) =>
    context.dispatch({ timestamp: new Date().getTime(), ...toast });

  return { dispatch, dismiss, dismissAll, toasts };
};

/// TOAST CONTAINER

interface IToastContainerProps {
  dismissToast: (index: number) => void;
  settings: IGlobalToastSettings;
  toasts: IToastNotification[];
}

/** Renders the toasts in a list in a fixed element overlaying everything */

const ToastContainer: React.FC<IToastContainerProps> = ({
  settings,
  dismissToast,
  toasts,
}) => (
  <div className="toast-container" data-location={settings.location}>
    <div className="toasts">
      {toasts.map((toast, i) => (
        <Toast
          {...toast}
          onDismiss={() => dismissToast(i)}
          settings={settings}
          key={toast.timestamp + toast.title}
        />
      ))}
    </div>
  </div>
);

/// TOAST

interface IToastProps extends IToastNotification {
  settings: IGlobalToastSettings;
  onDismiss: () => void;
}

/** Renders a single dismissable toast */

const Toast: React.FC<IToastProps> = ({
  title,
  message: description,
  type,
  settings,
  autodismiss,
  content,
  onDismiss,
  allowManualDismiss,
}) => {
  const autoDismissTimeout = React.useRef(null);
  const dismissingTimeout = React.useRef(null);

  const ref = React.useRef<HTMLDivElement>(null);

  const [dismissing, setDismissing] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  /** start dismiss of notification, set state to play animation and set up timeout for the actual removal from the toast array */

  const dismiss = React.useCallback(() => {
    setDismissing(true);

    dismissingTimeout.current = setTimeout(() => {
      setDismissed(true);
    }, settings.dismissTime);
  }, [settings.dismissTime, dismissingTimeout.current]);

  /** start timeout to autodismiss */

  const initialiseAutodismiss = React.useCallback(() => {
    if (autodismiss !== undefined) {
      autoDismissTimeout.current = setTimeout(dismiss, autodismiss);
    }
  }, [autodismiss, autoDismissTimeout.current, dismiss]);

  /** if set to, stop the autodismiss timeout on mouse enter */

  const mouseEnter = React.useCallback(
    () =>
      settings.disableAutodismissOnHover &&
      clearTimeout(autoDismissTimeout.current),
    [autoDismissTimeout.current, settings.disableAutodismissOnHover],
  );

  /** if set to, retrigger the autodismiss timeout on mouse leave */

  const mouseLeave = React.useCallback(
    () => settings.disableAutodismissOnHover && initialiseAutodismiss(),
    [initialiseAutodismiss, settings.disableAutodismissOnHover],
  );

  // set up autodismiss, and clear timeouts on cleanup

  React.useEffect(() => {
    initialiseAutodismiss();

    return () => {
      clearTimeout(autoDismissTimeout.current);
      clearTimeout(dismissingTimeout.current);
    };
  }, []);

  // Effect to listen to dismissed state, and call passed in dismiss method - needs to work like this, as the callback passed into
  // dismiss timeout doesn't update from the timeout being fired, but it needs to know the current index of the notification

  React.useEffect(() => {
    if (dismissed) {
      onDismiss();
    }
  }, [dismissed]);

  /** time for a step of the transition - one step is the time to disappear or reappear, the other is to expand or unexpand the space it's in */

  const transitionStep = React.useMemo(() => settings.dismissTime / 2 + "ms", [
    settings.dismissTime,
  ]);

  return (
    <div
      className="toast-notification"
      data-type={type}
      data-dismissing={dismissing}
      ref={ref}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      style={{
        transitionDelay: transitionStep,
        transitionDuration: transitionStep,
        animationDuration: transitionStep,
      }}
    >
      <div
        className="toast-notification-inner"
        style={{
          transitionDuration: transitionStep,
          animationDelay: transitionStep,
          animationDuration: transitionStep,
        }}
      >
        <div className="toast-notification-top">
          <h3>{title}</h3>

          {allowManualDismiss && (
            <div className="toast-dismiss" onClick={dismiss}>
              {settings.dismissButton}
            </div>
          )}
        </div>

        <p>{description}</p>

        {typeof content === "function" ? content(dismiss) : content}
      </div>
    </div>
  );
};

Toast.defaultProps = {
  allowManualDismiss: true,
};
