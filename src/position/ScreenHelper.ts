import { screen } from 'electron';

export class ScreenHelper {
  public getWorkArea(): { width: number; height: number } {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return { width, height };
  }

  public getCursorDisplay(): { width: number; height: number } {
    const point = screen.getCursorScreenPoint();
    const { width, height } = screen.getDisplayNearestPoint(point).workAreaSize;
    return { width, height };
  }

  public getScaleFactor(): number {
    const point = screen.getCursorScreenPoint();
    return screen.getDisplayNearestPoint(point).scaleFactor;
  }
}

