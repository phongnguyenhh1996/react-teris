import { cloneDeep } from 'lodash';

export default function(gameSettings) {
  return {
    't': (data) => ({
      cellsCount: 4,
      create: () => {
        const newData = cloneDeep(data);
        const mainPoint = {
          top: 0,
          left: Math.round(gameSettings.columns/2),
          isFalling: true
        }
        const newT = [
          mainPoint,
          {
            top: 0,
            left: mainPoint.left - 1,
            isFalling: true
          },
          {
            top: 0,
            left: mainPoint.left + 1,
            isFalling: true
          },
          {
            top: mainPoint.top + 1,
            left: mainPoint.left,
            isFalling: true
          }
        ];
        newData.push(...newT)
        return newData
      }
    })
  }
}