import { Show, SimpleShowLayout, TextField, TopToolbar, PrevNextButtons, ReferenceManyField, Datagrid, FunctionField, useRecordContext, WithListContext, useListContext, Button  } from 'react-admin';

import { useState } from 'react';

import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
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

function LinkToUser() {
    const recordContext = useRecordContext()
    if (!recordContext) return null;
    if ( recordContext.user == "total" ) {
        return <Typography component="span" variant="body1" textAlign="left">Usage</Typography>;
    } else if ( recordContext.user == "grant" ) {
        return <Typography component="span" variant="body1" textAlign="left">Grant</Typography>;
    } else {
        return <Link href={`#/users/${recordContext.user}/show`}>{recordContext.user}</Link>
    }
}

const PostTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>Project {record.id}</span>
}

function MakeGraph() {

    const listContext = useListContext()
    if (listContext.isLoading) return null;

    var data2 = {};
    var usageSum = {};
    var userlist = [];
    listContext.data.forEach((x) => {
        if ( !(x.ts in data2) ) {
            data2[x.ts] = {}
        }
        if ( !(x.user in usageSum) ) {
            usageSum[x.user] = x.usage;
        } else {
            usageSum[x.user] += x.usage;
        }
        data2[x.ts][x.user] = x.usage
        if (!userlist.includes(x.user)) {
            userlist.push(x.user);
        }

    });

    userlist.sort((a,b) => usageSum[b] - usageSum[a]);

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
                { userlist.map(( user,index ) => {
                    let stackId = "1";
                    let opacity = 1;
                    if ( user == "total" ) {
                        stackId = "2";
                        opacity = 0;
                    } else if ( user == "grant" ) {
                        stackId = "3";
                        opacity = 0;
                    }
                    return ( <Area dataKey={user} type="monotone" stroke={colourPicker(index)} fill={colourPicker(index)} fillOpacity={opacity} stackId={stackId}/> )
                })}
            </AreaChart>
        </ResponsiveContainer>
    )

}

export const GroupPage = () => {

    const twoWeeksAgo = dayjs().subtract(14,'day');
    
    const [fromDate, setFromDate] = useState(twoWeeksAgo);
    const [toDate, setToDate] = useState(dayjs());
    const [users, setUserList] = useState([]);

    const datefilter = fromDate && toDate ? { ts: [fromDate.toISOString(), toDate.toISOString()] } : {};

    const PostBulkActionButtons = () => {
        
        const { selectedIds } = useListContext();
        const newUserList = selectedIds.map(( k ) => ( k.split('_')[1] ) );

        const handleFilterButtonClick = () => {
            setUserList(newUserList);
        }

        const handleResetButtonClick = () => {
            setUserList([]);
        }

        return (
            <>
                <Button label="Reset Filter" onClick={handleResetButtonClick} />
                <Button label="Filter Graph" onClick={handleFilterButtonClick} />
            </>
        );
    };

    const userFilter = users.length != 0 ? { user: users } : {};
    const totalFilter = {...userFilter, ...datefilter};

    return (
        <Show title={<PostTitle/>} actions={
            <TopToolbar>
                <PrevNextButtons linkType="show"/>
            </TopToolbar>}>
            <SimpleShowLayout>
                <TextField source="id" label="Group Name" />
                <TextField source="gid" label="gid" />
                <ReferenceManyField label="Compute usage by User" target="project" reference="compute_latest" sort={{ field:'usage', order:'DESC'}} perPage={9999}>
                    <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
                        <FunctionField label="User" render={LinkToUser} sortBy="user" source="user"/>
                        <FunctionField label="SU Usage" render={record => `${formatSU(record.usage)}`} sortBy='usage' source='usage'/>
                    </Datagrid>
                </ReferenceManyField>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-au'>
                    <DatePicker label="From" value={fromDate} onChange={(newValue) => setFromDate(newValue)} minDate={dayjs("2023-09-05")}/>
                    <DatePicker label="To" value={toDate} onChange={(newValue) => setToDate(newValue)} minDate={dayjs("2023-09-05")}/>
                </LocalizationProvider>
                <ReferenceManyField label="Compute usage over time" target="project" reference="compute" sort={{field:'ts',order:'ASC'}} filter={totalFilter} perPage={99999}>
                    <WithListContext render={MakeGraph}/>
                </ReferenceManyField>
                
            </SimpleShowLayout>
            
        </Show>
    )
};