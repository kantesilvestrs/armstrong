import * as Color from "color";
import * as React from "react";
import { ClassHelpers } from "../../utilities/classHelpers";

interface IProgressBarProps {
  /** the progress of the bar from 0 to 100 */
  progress: number;

  /** the direction for the loading to increase */
  direction?: "left" | "right" | "down" | "up";

  /** the text to optionally display as a label */
  labelText?: string;

  /** the position to show the label - defaults to centre */
  labelVariant?: "centre" | "following";

  /** the thickness of the loading bar */
  thickness?: string;

  /** initial colour when progress is at 0 - will fade to endColour (both must be set) */
  startColour?: string;

  /** end colour when progress is at 100 - will fade from startColour (both must be set) */
  endColour?: string;

  className?: string;
}

export const ProgressBar: React.FunctionComponent<IProgressBarProps> = ({
  progress,
  direction,
  thickness,
  labelText,
  labelVariant,
  className,
  startColour,
  endColour
}) => {
  const outerStyle = React.useMemo<React.CSSProperties>(() => {
    switch (direction) {
      case "down":
      case "up":
        return { width: thickness };
      case "right":
      case "left":
        return { height: thickness };
    }
  }, [direction, thickness]);

  const clampedProgress = React.useMemo(
    () => Math.max(Math.min(progress, 100), 0),
    [progress]
  );

  const innerStyle = React.useMemo<React.CSSProperties>(() => {
    switch (direction) {
      case "down":
        return {
          top: 0,
          left: 0,
          right: 0,
          height: `${clampedProgress}%`
        };
      case "right":
        return {
          top: 0,
          left: 0,
          bottom: 0,
          width: `${clampedProgress}%`
        };
      case "up":
        return {
          bottom: 0,
          left: 0,
          right: 0,
          height: `${clampedProgress}%`
        };
      case "left":
        return {
          top: 0,
          right: 0,
          bottom: 0,
          width: `${clampedProgress}%`
        };
    }
  }, [clampedProgress, direction]);

  const labelStyle = React.useMemo<React.CSSProperties>(() => {
    switch (labelVariant) {
      case "following": {
        switch (direction) {
          case "down":
            return {
              top: `${clampedProgress}%`
            };
          case "right":
            return {
              left: `${clampedProgress}%`
            };
          case "up":
            return {
              bottom: `${clampedProgress}%`
            };
          case "left":
            return {
              right: `${clampedProgress}%`
            };
        }
      }
    }
  }, [clampedProgress, direction, labelVariant]);

  const startColourObj = React.useMemo(
    () => startColour && new Color(startColour),
    [startColour]
  );

  const endColourObj = React.useMemo(() => endColour && new Color(endColour), [
    endColour
  ]);

  const getChannel = React.useCallback(
    (channel: "red" | "green" | "blue") => {
      if (startColourObj && endColourObj) {
        const start = (startColourObj[channel]() as any) as number;
        const end = (endColourObj[channel]() as any) as number;

        const current = start + ((end - start) / 100) * clampedProgress;

        return current;
      }
    },
    [clampedProgress, startColourObj, endColourObj]
  );

  const currentColour = React.useMemo(() => {
    const r = getChannel("red");
    const g = getChannel("green");
    const b = getChannel("blue");
    return { r, g, b };
  }, [getChannel]);

  const colourStyle = React.useMemo<React.CSSProperties>(
    () =>
      startColour && endColour
        ? {
            backgroundColor: `rgb(${currentColour.r}, ${currentColour.g}, ${currentColour.b})`
          }
        : {},
    [startColour, endColour, currentColour]
  );

  return (
    <div
      className={ClassHelpers.classNames("progress-bar", className)}
      style={outerStyle}
      data-direction={direction}
      data-complete={clampedProgress >= 100}
    >
      <div
        className="progress-bar-inner"
        style={{ ...innerStyle, ...colourStyle }}
      />

      {labelText && (
        <p className="label" data-variant={labelVariant} style={labelStyle}>
          {labelText}
        </p>
      )}
    </div>
  );
};

ProgressBar.defaultProps = {
  thickness: "19px",
  direction: "right",
  labelVariant: "centre"
};

interface IAutoProgressBarProps extends Omit<IProgressBarProps, "progress"> {
  /** the time in ms to add to the remaining progress — defaults to 100 */
  increaseInterval?: number;

  /** the proportion of the remaining progress to add each time - defaults to 0.1 */
  increaseProportion?: number;

  /** the maximum the progress can be out of 100 if the content hasn't loaded yet - defaults to 98 */
  maxProgressBeforeLoaded?: number;

  /** will fill the loading bar */
  loaded?: boolean;
}

export const AutoProgressBar: React.FunctionComponent<
  IAutoProgressBarProps
> = ({
  increaseInterval,
  increaseProportion,
  loaded,
  maxProgressBeforeLoaded,
  ...props
}) => {
  const [progress, setProgress] = React.useState(0);
  const interval = React.useRef(null);

  const onInterval = React.useCallback(() => {
    setProgress(p => p + (maxProgressBeforeLoaded - p) * increaseProportion);
  }, [increaseInterval]);

  React.useEffect(() => {
    interval.current = setInterval(onInterval, increaseInterval);
    return () => {
      clearInterval(interval.current);
    };
  }, []);

  React.useEffect(() => {
    if (loaded) {
      clearInterval(interval.current);
      setProgress(100);
    }
  }, [loaded]);

  return <ProgressBar progress={progress} {...props} />;
};

AutoProgressBar.defaultProps = {
  increaseInterval: 100,
  increaseProportion: 0.1,
  maxProgressBeforeLoaded: 98
};
