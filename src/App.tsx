import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import type { DotProps, LegendProps } from "recharts";

import rawData from "./data";

interface IData {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

// Расчет z-score
const mean = (key: keyof Omit<IData, "name">) => rawData.reduce((sum, d) => sum + d[key], 0) / rawData.length;
const std = (key: keyof Omit<IData, "name">) => Math.sqrt(
  rawData.reduce((sum, d) => sum + Math.pow(d[key] - mean(key), 2), 0) / rawData.length
);

const data = rawData.map((d) => {
  const processedData = (key: keyof Omit<IData, "name">) => (d[key] - mean(key)) / std(key)
  return {
    ...d,
    z: {
      uv: processedData("uv"),
      pv: processedData("pv"),
    }
  };
});

// @ts-ignore {payload: IData, dataKey: string}
const CustomDot = ({ cx, cy, fill, payload, dataKey, r: radiusDot }: DotProps ) => {
  
  const color = Math.abs(payload.z[dataKey]) > 1 ? "red" : fill;
  return <circle cx={cx} cy={cy} r={radiusDot} fill={color} stroke="white" strokeWidth={2} />;
};

const CustomLegend = ({payload}: LegendProps ) => {
  return (
    <p style={{ textAlign: "center", margin: 0 }}>
      {
        payload?.map((entry, index) => {
          const {fill} = payload?.[index]?.payload as any
          return <span key={`item-${index}`} style={{ marginRight: "14px"}}>
            <svg className="recharts-surface" width="14" height="14" viewBox="0 0 32 32"
              style={{display: "inline-block", verticalAlign: "middle", marginRight: "4px"}}>
              <path stroke-width="4" fill={fill} stroke={fill} d="M0,16h10.666666666666666
              A5.333333333333333,5.333333333333333,0,1,1,21.333333333333332,16 H32M21.333333333333332,16
              A5.333333333333333,5.333333333333333,0,1,1,10.666666666666666,16"
              className="recharts-legend-icon"></path>
            </svg>
            <span>{entry.value}</span>
          </span>
})
      }
    </p>
  );
};

const generateGradientStops = (
  id: string,
  dataKey: keyof Omit<IData, "name" | "amt">,
  colorNormal: string
) => (
  <linearGradient id={id} x1="0%" y1="0" x2="100%" y2="0">
    {data.map((row, indx) => {
      const z = row.z[dataKey];
      const isOutlier = Math.abs(z) > 1;
      const offset = (offset=0) => `${((indx - offset) / (data.length - 1)) * 100}%`;
      const color = isOutlier ? "red" : colorNormal;
      const isPositivMiddle = !!indx && isOutlier && Math.abs(data[indx-1].z[dataKey]) > 1
        && Math.abs(data[indx-1].z[dataKey] + z) < 2;
      
      return (
        <>
        {isPositivMiddle && <stop offset={offset(0.5)} stopColor={colorNormal} />}
        <stop key={`${id}-${indx}`} offset={offset()} stopColor={color} />
        </>
      );
    })}
  </linearGradient>
);

export default function LineChartColorZScore() {

  const linesData = [
    { dataKey: "uv", stroke: "#82ca9d"},
    { dataKey: "pv", stroke: "#8884d8"}
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip/>
        <Legend content={<CustomLegend/>} />
        <defs>
        { linesData.map( ({dataKey, stroke}) => {
          return generateGradientStops(`${dataKey}Color`, dataKey as any, stroke) 
        })}
        </defs>
        { linesData.map( ({dataKey, stroke}) => {
          return <Line
              type="monotone"
              dataKey={dataKey}
              stroke={`url(#${dataKey}Color)`}
              fill={stroke}
              strokeWidth={3}
              activeDot={ (props: DotProps) => <CustomDot {...props} r={8} fill={stroke}/> }
              dot={ <CustomDot /> }
            />
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}