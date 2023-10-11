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

function PreparePlotData(prop, inData, missingaction="zero", missingtslookahead=6) {

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

  proplist.sort((a, b) => usageSum[b] - usageSum[a]);

  // Now fill gaps where we've missed all timestamps
  let currentDate = fromDate.unix();
  while ( currentDate < toDate.unix()){
    const existsInRange = allts.some((timestamp) => {
      return timestamp > currentDate && timestamp < (currentDate + (missingtslookahead*2)*3600)
    })
    if ( !existsInRange ) {
      allts.push(currentDate)
      data2[currentDate] = {};
    }
    currentDate = currentDate + missingtslookahead*3600;
  }

  allts.sort();

  // Now fill in the missing data
  allts.forEach( ( key, index ) => {
    proplist.forEach((proj) => {
      if (!(proj in data2[key])) {
        if (missingaction == "zero" ) {
          data2[key][proj] = 0.0
        } else if (missingaction == "prev") {
          if ( index > 0 ) {
            data2[key][proj] = data2[allts[index-1]][proj]
          } else {
            data2[key][proj] = 0.0
          }
        }
      }
    })
  })
  
  var dataArray = [];
  for (const [key, value] of Object.entries(data2)) {
    let tmpobj = { ts: parseInt(key) };
    let newobj = { ...value, ...tmpobj };

    dataArray.push(newobj);
  }

  dataArray.sort((a,b) => a.ts - b.ts)
  return { dataArray, proplist };
}

function MakeComputeGraphUser() {

    const listContext = useListContext();
    if (listContext.isLoading) return null;
    const { fromDate, toDate } = useContext(DateFilterContext);
    const { dataArray, proplist: projectlist } = PreparePlotData('project',listContext.data,"zero",6)

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={dataArray}>
          <XAxis dataKey="ts" type='number' tickFormatter={(x) => dayjs.unix(x).format('YYYY-MM-DD')} domain={[fromDate.unix(),toDate.unix()]}/>
          <YAxis type="number" tickFormatter={formatSUint} />
          <Tooltip label="thing"/>
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
  const { dataArray, proplist: userlist } = PreparePlotData('user',listContext.data,"zero",6)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={dataArray}>
        <XAxis dataKey="ts" type='number' tickFormatter={(x) => dayjs.unix(x).format('YYYY-MM-DD')} domain={[fromDate.unix(),toDate.unix()]}/>
        <YAxis type="number" tickFormatter={formatSUint} />
        <Tooltip label={(x) => dayjs.unix(x).format('YYYY-MM-DD HH:mm:ss')}/>
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