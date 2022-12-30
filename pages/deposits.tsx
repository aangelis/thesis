// import React from "react";
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import useUser from "lib/useUser";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from "@prisma/client"

import router from 'next/router'

import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
//import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { TrendingUpTwoTone } from "@mui/icons-material";

import {
  DataGrid,
  GridToolbar,
  GridColumns,
  GridRowsProp,
  GridEventListener,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import Link from "@mui/material/Link";


// Fetch deposits of current user
export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  const user: User = req.session.user!;

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
  }
  
  const prisma = new PrismaClient()

  interface Deposit {
    id: number;
    title: string;
    title_el: string;
    title_en: string;
    content: string | null;
    abstract_el: string | null;
    abstract_en: string | null;
    pages: number;
    language: string | null;
    images: number;
    tables: number;
    diagrams: number;
    maps: number;
    drawings: number;	
    confirmed: boolean;
    confirmed_timestamp: Date | null;
    license: string | null;
    comments: string | null;
    submitter_id: number;
    supervisor: string | null;
    new_filename: string | null;
    original_filename: string | null;
    submitter?: {
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
    }
    submitter_fullname?: string | null;
  }

  // in case of secretary find assigned users
  const assignedUsers = user.isSecretary?
    (await prisma.permission.findMany({
      where: {
        secretary_id: user!.id!
      },
      select: {
        submitter_email: true,
      }
    }))
    :
    []

  const emails: string[] = [];
  assignedUsers.forEach(({submitter_email: v}) => emails.push(v))

  const deposits: Deposit[] = user.is_superuser?
  (user.isSecretary?
    // in case of secretary show only deposits of assigned users
    // find find submitter id, email, first and last name
    (await prisma.deposit.findMany({
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          }
        }
      },
      where: {
        submitter: {
          email: { in: emails },
        }
      }
    }))
    :
    // in case of superuser find submitter first and last name
    (await prisma.deposit.findMany({
      include: {
        submitter: {
          select: {
            first_name: true,
            last_name: true,
          }
        }
      }
    }))
  )
  :
  (await prisma.deposit.findMany({
    where: {
      submitter_id: user.id || undefined,
    }
  }))

  deposits.map((x) => {
    x.submitter_fullname = x.submitter?.first_name + ' ' + x.submitter?.last_name;
    return x;
  })

  const unconfirmedCount = !user.is_superuser?
    ((await prisma.deposit.aggregate({
      where: {
        submitter_id: user.id!,
        confirmed: false,
      },
      _count: {
        confirmed: true,
      },
    }))._count.confirmed || 0)
    : 0

  const addNewCount = !user.is_superuser?
    ((await prisma.permission.aggregate({
      where: {
        submitter_email: user.email!,
        due_to: {
          gte: new Date(),
          // gte: new Date('2022-12-26'),
        },
      },
      _count: {
        _all: true
      }
    }))._count._all || 0)
    : 0

  return {
    props : { user, deposits: JSON.parse(JSON.stringify(deposits)), unconfirmedCount, addNewCount }
  }
}, sessionOptions);


interface Data {
  id: number;
  title_el: string;
  title_en: string;
  pages: number;
  language: string;
  images: number;
  tables: number;
  diagrams: number;
  maps: number;
  drawings: number;
  supervisor: string;
  // confirmed: boolean;
  confirmed: string;
  confirmed_timestamp: string;
  submitter_fullname: string;
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton nonce={undefined} onResize={undefined} onResizeCapture={undefined} />
      <GridToolbarFilterButton nonce={undefined} onResize={undefined} onResizeCapture={undefined}  />
      <GridToolbarDensitySelector nonce={undefined} onResize={undefined} onResizeCapture={undefined} />
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  );
}

export default ((
  { user, deposits, unconfirmedCount, addNewCount }: InferGetServerSidePropsType<typeof getServerSideProps>,
  ) => {

  const columns: GridColumns = [
    {
      field: 'title_el',
      headerName: 'Τίτλος',
      headerAlign: 'center',
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <span><Link sx={{cursor: 'pointer'}} color="inherit" onClick={() => router.push('/deposit/'+params.row.id)}>{params.value}</Link></span>
        </Tooltip>
      ),

    },
    {
      field: 'title_en',
      headerName: 'Τίτλος (Αγγλικά)',
      headerAlign: 'center',
      width: 250,
      editable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      ),
    },
    {
      field: 'submitter_fullname',
      headerName: 'Χρήστης',
      headerAlign: 'center',
      width: 250,
      hide: !user?.is_superuser,
      editable: false,
    },
    {
      field: 'confirmed',
      headerName: 'Επικυρωμένη',
      headerAlign: 'center',
      width: 120,
      type: 'boolean',
      editable: true,
    },
    {
      field: 'confirmed_timestamp',
      headerName: 'Ημερομηνία Επικύρωσης',
      headerAlign: 'center',
      width: 180,
      type: 'dateTime',
      editable: true,
    },
    {
      field: 'pages',
      headerName: 'Σελίδες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
    },
    {
      field: 'images',
      headerName: 'Εικόνες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
    },
    {
      field: 'tables',
      headerName: 'Πίνακες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
    },
    {
      field: 'diagrams',
      headerName: 'Διαγράμματα',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
    },
    {
      field: 'maps',
      headerName: 'Χάρτες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
    },
    {
      field: 'drawings',
      headerName: 'Σχέδια',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
    },
    {
      field: 'supervisor',
      headerName: 'Επιβλέπων',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      ),
    },
    
    
  ];

  // const handleEvent: GridEventListener<'rowClick'> = (
  //   params, // GridRowParams
  //   event, // MuiEvent<React.MouseEvent<HTMLElement>>
  //   details, // GridCallbackDetails
  // ) => {
  //   router.push('/deposit/'+params.row.id)
  // };

  // Rendered more hooks than during the previous render with custom hook
  const tableToShow = (
    <div style={{ height: 300, width: '100%' }}>
    <DataGrid
      rows={deposits}
      columns={columns}
      experimentalFeatures={{ newEditingApi: true }}
      // onRowClick={handleEvent}
      components={{ Toolbar: CustomToolbar }}
      autoHeight={true}
    />
    </div> 
  )

  const canAddNewDeposit = !user?.is_superuser && unconfirmedCount < addNewCount;
  
  const hasDeposits = deposits && Object.keys(deposits).length > 0

  return (
    <Layout>
      { user?.is_superuser && (
        <h1>Λίστα αποθέσεων</h1>
      )}
      { !user?.is_superuser && (
        <h1>Οι αποθέσεις μου</h1>
      )}
      { !hasDeposits && (
        <h3>Δεν βρέθηκαν αποθέσεις</h3>
      )}
      { !user?.is_superuser && !canAddNewDeposit && (
        <Box sx={{ '& > button': { m: 1 }, color: 'red' }}>
          <h3>Δεν έχετε δικαιώματα δημιουργίας απόθεσης</h3>
        </Box>
      )}
      { !user?.is_superuser && canAddNewDeposit && (
        <Box sx={{ '& > button': { m: 1 } }}>
          <Button
              color="secondary"
              onClick={() => router.push('/deposit/new')}
              startIcon={<AddCircleOutlineIcon />}
              variant="contained"
            >
              δημιουργια νεας αποθεσης
            </Button>
        </Box>
      )}
      { hasDeposits && tableToShow }
    </Layout>
  )

});
