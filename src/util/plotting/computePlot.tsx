import { useListContext } from 'react-admin';
import React, { useContext } from 'react';
import {
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
  } from "recharts";

import { formatSUint } from "../formatting/formatSUint";
import { colourPicker } from "../formatting/colourPicker";

import dayjs from "dayjs";
import "dayjs/locale/en-au";

const DateFilterContext = React.createContext(null)

function PreparePlotData(prop, inData) {

  const { fromDate, toDate } = useContext(DateFilterContext);

  var data2: { [key: number]: number; } = {};
  var usageSum = {};
  var proplist: string[] = [];
  var allts = []
  inData.forEach((x) => {
    let ts = dayjs(x.ts).unix()
    allts.push(ts);
    if (!(ts in data2)) {
      data2[ts] = {};
    }
    if (!(x.project in usageSum)) {
      usageSum[x[prop]] = x.usage;
    } else {
      usageSum[x[prop]] += x.usage;
    }
    data2[ts][x[prop]] = x.usage;
    if (!proplist.includes(x[prop])) {
      proplist.push(x[prop]);
    }
  });
  // Fill in gaps for known timestamps

  for ( const key in data2 ) {
    proplist.forEach((proj) => {
      if (!(proj in data2[key])) {
        data2[key][proj] = 0.0
      }
    })
  }

  proplist.sort((a, b) => usageSum[b] - usageSum[a]);

  var dataArray = [];
  for (const [key, value] of Object.entries(data2)) {
    let tmpobj = { ts: parseInt(key) };
    let newobj = { ...value, ...tmpobj };

    dataArray.push(newobj);
  }

  // Now fill gaps where we've missed all timestamps
  let currentDate = fromDate.unix();
  while ( currentDate < toDate.unix()){
    const existsInRange = allts.some((timestamp) => {
      return timestamp > currentDate && timestamp < (currentDate + 12*3600)
    })
    if ( !existsInRange ) {
      var tmpobj = {}
      proplist.forEach((proj) => {
        tmpobj[proj] = 0.0
      } )
      dataArray.push({...tmpobj, ts:currentDate})
    } 
    currentDate = currentDate + 6*3600;
  }

  dataArray.sort((a,b) => a.ts - b.ts)
  return { dataArray, proplist };
}

function MakeComputeGraphUser() {

    const listContext = useListContext();
    if (listContext.isLoading) return null;
    const { fromDate, toDate } = useContext(DateFilterContext);
    const { dataArray, proplist: projectlist } = PreparePlotData('project',listContext.data)

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={dataArray}>
          <XAxis dataKey="ts" type='number' tickFormatter={(x) => dayjs.unix(x).format('YYYY-MM-DD')} domain={[fromDate.unix(),toDate.unix()]}/>
          <YAxis type="number" tickFormatter={formatSUint} />
          <Tooltip />
          <Legend />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          {projectlist.map((project, index) => {
            return (
              <Area
                dataKey={project}
                type="monotone"
                stroke={colourPicker(index)}
                fill={colourPicker(index)}
                stackId="1"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    );
}

function MakeComputeGraphProj() {

  const { fromDate, toDate } = useContext(DateFilterContext);
  const listContext = useListContext();
  if (listContext.isLoading) return null;
  const { dataArray, proplist: userlist } = PreparePlotData('user',listContext.data)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={dataArray}>
        <XAxis dataKey="ts" type='number' tickFormatter={(x) => dayjs.unix(x).format('YYYY-MM-DD')} domain={[fromDate.unix(),toDate.unix()]}/>
        <YAxis type="number" tickFormatter={formatSUint} />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {userlist.map((user, index) => {
          let stackId = "1";
          let opacity = 1;
          if (user == "total") {
            stackId = "2";
            opacity = 0;
          } else if (user == "grant") {
            stackId = "3";
            opacity = 0;
          }
          return (
            <Area
              dataKey={user}
              type="monotone"
              stroke={colourPicker(index)}
              fill={colourPicker(index)}
              fillOpacity={opacity}
              stackId={stackId}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { DateFilterContext, MakeComputeGraphUser, MakeComputeGraphProj };