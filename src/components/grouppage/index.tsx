import { Show, SimpleShowLayout, TextField, TopToolbar, PrevNextButtons, ReferenceManyField, Datagrid, FunctionField, useRecordContext, InfiniteList, useInfinitePaginationContext, RecordContextProvider } from 'react-admin';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';

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

const LoadMore = () => {
    const {
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfinitePaginationContext();
    return hasNextPage ? (
        <Box mt={1} textAlign="center">
            <Button
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
            >
                Load more
            </Button>
        </Box>
    ) : null;
};

export const GroupPage = () => {

    return (
        <Show actions={
            <TopToolbar>
                <PrevNextButtons linkType="show"/>
            </TopToolbar>}>
            <SimpleShowLayout>
                <TextField source="id" label="Group Name" />
                <TextField source="gid" label="gid" />
                <ReferenceManyField label="Compute usage by User" target="project" reference="compute_latest" sort={{ field:'usage', order:'DESC'}}>
                    <Datagrid bulkActionButtons={false}>
                        <FunctionField label="User" render={LinkToUser} sortBy="user" source="user"/>
                        <FunctionField label="SU Usage" render={record => `${record.usage} SU`} sortBy='usage' source='usage'/>
                    </Datagrid>
                </ReferenceManyField>
            </SimpleShowLayout>
            
        </Show>
    )
};