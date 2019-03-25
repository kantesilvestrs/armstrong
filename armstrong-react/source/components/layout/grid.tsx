import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "underscore";
import { ClassHelpers } from "../../utilities/classNames";
import { BgColorClass, FgColorClass, HorizontalAlignment, LayoutHelpers, MarginClass, PaddingClass, VerticalAlignment } from "./../../utilities/uiHelpers";

export interface IGrid extends React.HTMLAttributes<HTMLDivElement> {
  /** (boolean) Wether to render borders around grid parts */
  debugMode?: boolean;
  /** (boolean) ADVANCED: Turns of automatic fix of safari6 compat wrapper */
  disableFlexOverride?: boolean;
  /** (string) CSS classname property */
  className?: string | MarginClass | PaddingClass | BgColorClass | FgColorClass;
  /** (boolean) Render the first row to simulate a table header */
  table?: boolean;
  /** (boolean) Wether the table should expand and divide to fill its container */
  fillContainer?: boolean;
  /** (string) An HTML tag to use for the root element instead of <div> */
  tagName?: keyof React.ReactHTML;
}

export function Grid(props: IGrid) {
  // const originalClassName = props.className;
  const { className, debugMode, disableFlexOverride, table, fillContainer, tagName, ...attrs } = props

  const classes = ClassHelpers.classNames(
    className,
    "grid",
    {
      "fill-container": fillContainer,
      "grid-debug": debugMode,
      "table-grid": table,
    },
  );

  if (fillContainer && !disableFlexOverride) {
    React.useEffect(() => {
      const domNode = ReactDOM.findDOMNode(this);
      if (!domNode) {
        return
      }
      (domNode.parentElement as HTMLElement).style.position = "relative";
    }, [])
    return React.createElement(tagName || "div", { className: "flex-override" }, <div {...attrs} className={classes} />)
  }

  return React.createElement(tagName || "div", { ...attrs, className: classes });
}

function sizeErrorMessage(size: string, sizeValue: string, controlPath: string) {
  return `Unsupported ${size} property '${sizeValue}' on ${controlPath}. If you are using a string, make sure it is either 'auto' or follows the pattern '[number]*'`
}

export interface IRow extends React.HTMLAttributes<HTMLDivElement> {
  /** (number | string) Sets a fixed height for the row, or 'auto' to grow to fit its content */
  height?: number | string;
  /** (string) CSS classname property */
  className?: string | MarginClass | PaddingClass | BgColorClass | FgColorClass;
  /** (string) An HTML tag to use for the root element instead of <div> */
  tagName?: string;
  /** (Col[]) A row must contain one or many <Col/> elements */
  children?: React.ReactNode;
}

export function Row(props: IRow) {
  const { className, height, tagName, style, ...attrs } = props

  function needsFixed() {
    if (!height) {
      return false;
    }
    if (typeof height === "number") {
      return true
    } else {
      if (height === "auto") {
        return true;
      }
    }
    return false;
  }

  const classes = ClassHelpers.classNames(className, "row", needsFixed() ? "no-flex" : "");
  let styles = style;
  if (height) {
    if (typeof height === "number") {
      styles = _.extend({ height: `${height}px` }, styles);
    } else {
      const hString = (height as string);
      const starIndex = hString.indexOf("*");
      if (height === "auto") {
        // do nothing
      } else if (starIndex !== -1 && parseFloat(hString)) {
        const spans = (height as string).substr(0, starIndex);
        styles = _.extend({ flex: `${spans}` }, styles);
      } else {
        // tslint:disable-next-line:no-console
        console.error(sizeErrorMessage("height", height, "Grid > Row"))
      }
    }
  }

  return React.createElement(tagName || "div", { ...attrs, className: classes, style: styles },
    React.Children.map(props.children, (c: React.ReactElement<any>) => {
      return c ? React.cloneElement(c, { style: c.props.style }) : null
    }),
  )

}

export interface ICol extends React.HTMLAttributes<HTMLDivElement> {
  /** (HorizontalAlignment(string)) How to align content horizontally in this column */
  horizontalAlignment?: HorizontalAlignment;
  /** (HorizontalAlignment(string)) How to align content vertically in this column */
  verticalAlignment?: VerticalAlignment;
  /** (number | string) Sets a fixed width for the column, or 'auto' to grow to fit its content */
  width?: number | string;
  /** (string) An HTML tag to use for the root element instead of <div> */
  tagName?: string;
  /** (string) CSS classname property */
  className?: string | MarginClass | PaddingClass | BgColorClass | FgColorClass;
}

export function Col(props: ICol) {
  const { className, width, horizontalAlignment, verticalAlignment, tagName, style, ...attrs } = props
  function needsFixed() {
    if (!width) {
      return false;
    }
    if (typeof width === "number") {
      return true
    } else {
      if (width === "auto") {
        return true;
      }
    }
    return false;
  }
  const alignmentClasses = LayoutHelpers.GetAlignmentClasses(verticalAlignment, horizontalAlignment);
  const classes = ClassHelpers.classNames(
    "col",
    className,
    alignmentClasses,
    {
      "no-flex": needsFixed(),
    },
  );

  let styles = style;

  if (width) {
    if (typeof width === "number") {
      styles = _.extend({ maxwidth: `${width}px`, width: "100%" }, styles);
    } else {
      const wString = (width as string);
      const starIndex = wString.indexOf("*");
      if (width === "auto") {
        // do nothing
      } else if (starIndex !== -1 && parseFloat(wString)) {
        const spans = wString.substr(0, starIndex);
        styles = _.extend({ flex: `${spans}` }, styles);
      } else {
        // tslint:disable-next-line:no-console
        console.error(sizeErrorMessage("width", width, "Grid > Row > Col"))
      }
    }
  }

  if (typeof width === "number") {
    styles = _.extend({ maxWidth: `${width}px`, width: "100%" }, styles);
  }

  return React.createElement(tagName || "div", { ...attrs, className: classes, style: styles })
}
