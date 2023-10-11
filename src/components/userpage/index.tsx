import {
  Show,
  TextField,
  useRecordContext,
  TopToolbar,
  PrevNextButtons,
  ReferenceManyField,
  Datagrid,
  FunctionField,
  useListContext,
  Button,
  WithListContext,
  TabbedShowLayout,
  SimpleShowLayout,
} from "react-admin";

import React, { useState } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";
import "dayjs/locale/en-au";

import { formatSU } from "../../util/formatting/formatSU";

import Chip from "@mui/material/Chip";
import { formatStorage } from "../../util/formatting/formatStorage";
import { MakeComputeGraphUser, DateFilterContext } from "../../util/plotting/computePlot";
import {
  LinkToGroup,
  LinkToGroupGdata,
  LinkToGroupScratch,
} from "../../util/linking";


const PostTitle = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <span>
      {record.pw_name} ({record.id})
    </span>
  );
};

const TagsField = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <div>
      {record.groups.map((item) => (
        <Chip
          label={item}
          component="a"
          href={`#/groups/${item}/show`}
          clickable
        />
      ))}
    </div>
  );
};

export const UserPage = () => {

  const [projects, setProjectList] = useState([]);
  const [ fromDate, setFromDate ] = useState(dayjs().subtract(14,'day') );
  const [ toDate, setToDate ] = useState(dayjs());
  const datefilter = fromDate && toDate ? { ts: [fromDate.toISOString(), toDate.toISOString()] } : {};

  const PostBulkActionButtons = () => {
    const { selectedIds } = useListContext();
    const newProjectList = selectedIds.map((k) => k.split("_")[2]);

    const handleFilterButtonClick = () => {
      setProjectList(newProjectList);
    };

    const handleResetButtonClick = () => {
      setProjectList([]);
    };

    return (
      <>
        <Button label="Reset Filter" onClick={handleResetButtonClick} />
        <Button label="Filter Graph" onClick={handleFilterButtonClick} />
      </>
    );
  };

  
  const projectFilter = projects.length != 0 ? { project: projects } : {};
  const totalFilter = { ...projectFilter, ...datefilter };

  return (
    <Show
      title={<PostTitle />}
      actions={
        <TopToolbar>
          <PrevNextButtons linkType="show" />
        </TopToolbar>
      }
    >
      <DateFilterContext.Provider value={{ fromDate: fromDate, toDate: toDate }}>
      <SimpleShowLayout>
        <TextField source="id" label="Username" />
        <TextField source="pw_name" label="Name" />
        <TagsField label="Projects" />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-au">
          <DatePicker
            label="From"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            minDate={dayjs("2023-09-05")}
          />
          <DatePicker
            label="To"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            minDate={dayjs("2023-09-05")}
          />
        </LocalizationProvider>
      </SimpleShowLayout>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Compute">
        <ReferenceManyField
            label="Compute usage over time"
            target="user"
            reference="compute"
            sort={{ field: "ts", order: "ASC" }}
            filter={totalFilter}
            perPage={99999}
          >
            <WithListContext render={MakeComputeGraphUser} />
          </ReferenceManyField>
          <ReferenceManyField
            label="Compute usage in Projects"
            target="user"
            reference="compute_latest"
            sort={{ field: "usage", order: "DESC" }}
          >
            <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
              <FunctionField
                label="Project"
                render={LinkToGroup}
                sortBy="project"
                source="project"
              />
              <FunctionField
                label="SU Usage"
                render={(record) => `${formatSU(record.usage)}`}
                sortBy="usage"
                source="usage"
              />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="/scratch" path="scratch">
          <ReferenceManyField
            label="/scratch usage across all projects"
            target="user"
            reference="storage_latest"
            sort={{ field: "size", order: "DESC" }}
            filter={{ fs: "scratch" }}
          >
            <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
              <FunctionField
                label="Directory"
                render={LinkToGroupScratch}
                sortBy="location"
                source="location"
              />
              <FunctionField
                label="Group Ownership"
                render={LinkToGroup}
                sortBy="ownership"
                source="ownership"
              />
              <FunctionField
                label="Data Usage"
                render={(record) => `${formatStorage(record.size)}`}
                sortBy="size"
                source="size"
              />
              <FunctionField
                label="# Files"
                render={(record) => `${record.inodes.toLocaleString()}`}
                sortBy="inodes"
                source="inodes"
              />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="/g/data" path="gdata">
          <ReferenceManyField
            label="/scratch usage across all projects"
            target="user"
            reference="storage_latest"
            sort={{ field: "size", order: "DESC" }}
            filter={{ fs: "gdata" }}
          >
            <Datagrid bulkActionButtons={<PostBulkActionButtons />}>
              <FunctionField
                label="Directory"
                render={LinkToGroupGdata}
                sortBy="location"
                source="location"
              />
              <FunctionField
                label="Group Ownership"
                render={LinkToGroup}
                sortBy="ownership"
                source="ownership"
              />
              <FunctionField
                label="Data Usage"
                render={(record) => `${formatStorage(record.size)}`}
                sortBy="size"
                source="size"
              />
              <FunctionField
                label="# Files"
                render={(record) => `${record.inodes.toLocaleString()}`}
                sortBy="inodes"
                source="inodes"
              />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
      </DateFilterContext.Provider>
    </Show>
  );
};
