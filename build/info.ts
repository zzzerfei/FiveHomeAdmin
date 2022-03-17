// 这是啥
import { readdir, stat } from 'fs';

import type { Plugin } from 'vite'
import dayjs, { Dayjs } from 'dayjs'
import {sum} from 'lodash-unified'
import duration from 'dayjs/plugin/duration'
import { green, blue, bold } from 'picocolors'

dayjs.extend(duration)

const staticPath = 'dist'
const fileListTotal: number[] = []

const recursiveDirectory = (folder: string, callback: Function): void => {
  readdir(folder, (err, files: string[]) => {
    if (err) throw err
    let count = 0
    const checkEnd = () => {
      ++count == files.length && callback()
    }
    files.forEach((item: string) => {
      stat(folder + '/' + item, async (err, stats) => {
        if (err) throw err
        if (stats.isFile()) {
          fileListTotal.push(stats.size)
          checkEnd()
        } else if (stats.isDirectory()) {
          recursiveDirectory(`${staticPath}/${item}/`, checkEnd)
        }
      })
    })
    files.length === 0 && callback()
  })
}

// 计算打包后的大小
const formatBytes = (a: number, b?: number): string => {
  if (0 == a) return '0 Bytes'
  const c = 1024,
    d = b || 2,
    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    f = Math.floor(Math.log(a) / Math.log(c))
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + '' + e[f]
}

// 打包信息
export function viteBuildInfo(): Plugin {
  let config: { command: string };
  let startTime: Dayjs;
  let endTime: Dayjs;
  return {
    name: "vite:buildInfo",
    configResolved(resolvedConfig: { command: string }) {
      config = resolvedConfig;
    },
    buildStart() {
      console.log(
        bold(
          green(
            `👏欢迎使用${blue(
              "[vue-pure-admin]"
            )}`
          )
        )
      );
      if (config.command === "build") {
        startTime = dayjs(new Date());
      }
    },
    closeBundle() {
      if (config.command === "build") {
        endTime = dayjs(new Date());
        recursiveDirectory(staticPath, () => {
          console.log(
            bold(
              green(
                `恭喜打包完成🎉（总用时${dayjs
                  .duration(endTime.diff(startTime))
                  .format("mm分ss秒")}，打包后的大小为${formatBytes(
                    sum(fileListTotal)
                  )})`
              )
            )
          );
        });
      }
    }
  };
}




