import { Show, SimpleShowLayout, TextField, useRecordContext, TopToolbar, PrevNextButtons, ReferenceManyField, Datagrid, FunctionField, useListContext, Button, WithListContext} from 'react-admin';

import React, { useState } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';
import 'dayjs/locale/en-au';

import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

import { formatSU } from '../../util/formatting/formatSU';
import { formatSUint } from '../../util/formatting/formatSUint';
import { formatDate } from '../../util/formatting/formatDate';
import { colourPicker } from '../../util/formatting/colourPicker';

import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';

function LinkToGroup() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    return <Link href={`#/groups/${recordContext.project}/show`}>{recordContext.project}</Link>
}

const PostTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{record.pw_name} ({record.id})</span>
}

const TagsField = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <div>
            {record.groups.map(item => (
                <Chip label={item} component="a" href={`#/groups/${item}/show`} clickable/>
            ))}
        </div>
    )
};

function MakeGraph() {

    const listContext = useListContext()
    if (listContext.isLoading) return null;

    var data2 = {};
    var usageSum = {};
    var projectlist = [];
    listContext.data.forEach((x) => {
        if ( !(x.ts in data2) ) {
            data2[x.ts] = {}
        }
        if ( !(x.project in usageSum) ) {
            usageSum[x.project] = x.usage;
        } else {
            usageSum[x.project] += x.usage;
        }
        data2[x.ts][x.project] = x.usage
        if (!projectlist.includes(x.project)) {
            projectlist.push(x.project);
        }

    });

    projectlist.sort((a,b) => usageSum[b] - usageSum[a]);

    var dataArray = [];
    for ( const [key,value] of Object.entries(data2)) {
        let tmpobj = { "ts": key };
        let newobj = { ...value, ...tmpobj };
        dataArray.push(newobj);
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dataArray}>
                <XAxis dataKey="ts" tickFormatter={formatDate}/>
                <YAxis type="number" tickFormatter={formatSUint}/>
                <Tooltip />
                <Legend />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                { projectlist.map(( project,index ) => {
                    return ( <Area dataKey={project} type="monotone" stroke={colourPicker(index)} fill={colourPicker(index)} stackId='1'/> )
                })}
            </AreaChart>
        </ResponsiveContainer>
    )

}

export const UserPage = () => {

    const twoWeeksAgo = dayjs().subtract(14,'day');
    
    const [fromDate, setFromDate] = useState(twoWeeksAgo);
    const [toDate, setToDate] = useState(dayjs());
    const [projects, setProjectList] = useState([]);

    const datefilter = fromDate && toDate ? { ts: [fromDate.toISOString(), toDate.toISOString()] } : {};

    const PostBulkActionButtons = () => {
        
        const { selectedIds } = useListContext();
        const newProjectList = selectedIds.map(( k ) => ( k.split('_')[2] ) );

        const handleFilterButtonClick = () => {
            setProjectList(newProjectList);
        }

        const handleResetButtonClick = () => {
            setProjectList([]);
        }

        return (
            <>
                <Button label="Reset Filter" onClick={handleResetButtonClick} />
                <Button label="Filter Graph" onClick={handleFilterButtonClick} />
            </>
        );
    };

    const projectFilter = projects.length != 0 ? { project: projects } : {};
    const totalFilter = {...projectFilter, ...datefilter};

    return (
        <Show title={<PostTitle/>} actions={
            <TopToolbar>
                <PrevNextButtons linkType="show"/>
            </TopToolbar>}>
            <SimpleShowLayout>
                <TextField source="id" label="Username" />
                <TextField source="pw_name" label="Name" />
                <TagsField label="Projects"/>
                <ReferenceManyField label="Compute usage in Projects" target="user" reference="compute_latest">
                    <Datagrid  bulkActionButtons={<PostBulkActionButtons />}>
                        <FunctionField label="Project" render={LinkToGroup} sortBy="project" source="project"/>
                        <FunctionField label="SU Usage" render={record => `${formatSU(record.usage)}`} sortBy='usage' source='usage'/>
                    </Datagrid>
                </ReferenceManyField>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-au'>
                    <DatePicker label="From" value={fromDate} onChange={(newValue) => setFromDate(newValue)} minDate={dayjs("2023-09-05")}/>
                    <DatePicker label="To" value={toDate} onChange={(newValue) => setToDate(newValue)} minDate={dayjs("2023-09-05")}/>
                </LocalizationProvider>
                <ReferenceManyField label="Compute usage over time" target="user" reference="compute" sort={{field:'ts',order:'ASC'}} filter={totalFilter} perPage={99999}>
                    <WithListContext render={MakeGraph}/>
                </ReferenceManyField>
            </SimpleShowLayout>
            
        </Show>
    )
};