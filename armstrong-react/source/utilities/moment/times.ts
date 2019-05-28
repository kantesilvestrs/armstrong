import * as moment from "moment";
import { ITimeParts, ITimeUtils } from "../definitions";

export class MomentTimeUtils implements ITimeUtils {
  getParts(time: string): ITimeParts {
    const d = moment(time, "HH:mm", false);
    if (!d.isValid()) {
      return
    }
    return { hours: d.hour(), minutes: d.minute() };
  }
}
