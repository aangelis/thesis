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
import Box from '@mui/material/Box';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Link from "@mui/material/Link";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
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
  GridValueFormatterParams,
  GridRowParams,
  GridToolbarQuickFilter,
  elGR,
} from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { elGR as pickersElGR } from '@mui/x-date-pickers';
import { elGR as coreElGR } from '@mui/material/locale';
import Grid from "@mui/material/Grid";

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
      name_el: string | null;
      surname_el: string | null;
      department: string | null;
      title: string | null;
    }
    submitter_fullname?: string | null;
    // submitter_department?: string | null;
    // submitter_title?: string | null;
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
  ((user.isSecretary && !user.isAdmin)?
    // in case of secretary show only deposits of assigned users
    // find find submitter id, email, first and last name
    (await prisma.deposit.findMany({
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            name_el: true,
            surname_el: true,
            department: true,
            title: true,
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
            id: true,
            email: true,
            name_el: true,
            surname_el: true,
            department: true,
            title: true,
          }
        }
      }
    }))
  )
  :
  (await prisma.deposit.findMany({
    where: {
      submitter_id: user.id || undefined,
    },
    include: {
      submitter: {
        select: {
          id: true,
          email: true,
          name_el: true,
          surname_el: true,
          department: true,
          title: true,
        }
      }
    }
  }))

  deposits.map((x) => {
    x.submitter_fullname = x.submitter?.surname_el + ' ' + x.submitter?.name_el;
    // x.submitter_department = x.submitter?.department;
    // x.submitter_title = x.submitter?.title;
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

    const canAddNewDeposit = !user?.is_superuser && unconfirmedCount < addNewCount;

  return {
    props : { user, deposits: JSON.parse(JSON.stringify(deposits)), canAddNewDeposit }
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
  license: string;
  submitter_fullname: string;
  // submitter_department: string;
  // submitter_title: string;
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <Grid container item xs>
        <GridToolbarColumnsButton nonce={undefined} onResize={undefined} onResizeCapture={undefined} />
        <GridToolbarFilterButton nonce={undefined} onResize={undefined} onResizeCapture={undefined}  />
        <GridToolbarDensitySelector nonce={undefined} onResize={undefined} onResizeCapture={undefined} />
        <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
      </Grid>
      <Grid>
        <GridToolbarQuickFilter />
      </Grid>
    </GridToolbarContainer>
  );
}

export default ((
  { user, deposits, canAddNewDeposit }: InferGetServerSidePropsType<typeof getServerSideProps>,
  ) => {
  
  // https://v4.mui.com/ru/api/data-grid/grid-col-def/
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
      field: 'abstract_el',
      headerName: 'Περίληψη',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
    },
    {
      field: 'abstract_en',
      headerName: 'Περίληψη (Αγγλικά)',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
    },
    {
      field: 'keywords_el',
      headerName: 'Λέξεις κλειδιά',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
    },
    {
      field: 'keywords_en',
      headerName: 'Λέξεις κλειδιά (Αγγλικά)',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
    },
    {
      field: 'submitter_fullname',
      headerName: 'Δημιουργός',
      headerAlign: 'center',
      width: 250,
      hide: !user?.is_superuser,
      editable: false,
    },
    {
      field: 'submitter_department',
      headerName: 'Τμήμα',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      // valueGetter: (params) => params.row.submitter.department,
    },
    {
      field: 'submitter_title',
      headerName: 'Τίτλος χρήστη',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      // valueGetter: (params) => params.row.submitter.title,
    },
    {
      field: 'language',
      headerName: 'Γλώσσα',
      headerAlign: 'center',
      width: 120,
      hide: true,
      editable: false,
    },
    {
      field: 'confirmed',
      headerName: 'Επιβεβαιωμένη',
      headerAlign: 'center',
      width: 120,
      type: 'boolean',
      editable: false,
    },
    {
      field: 'confirmed_timestamp',
      headerName: 'Ημερομηνία Επιβεβαίωσης',
      headerAlign: 'center',
      width: 300,
      type: 'dateTime',
      editable: false,
      valueFormatter: (params: GridValueFormatterParams) => (
        params.value? new Date(params.value) : ""
      ),
    },
    {
      field: 'license',
      headerName: 'Άδεια',
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
    {
      field: 'date_created',
      headerName: 'Ημερομηνία Δημιουργίας',
      headerAlign: 'center',
      width: 300,
      hide: true,
      type: 'dateTime',
      editable: false,
      valueFormatter: (params: GridValueFormatterParams) => (
        params.value? new Date(params.value) : ""
      ),
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
      description: 'Διαγράμματα',
      headerAlign: 'center',
      width: 80,
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

  const [pageSize, setPageSize] = React.useState<number>(100)

  const theme = createTheme(
    {
      palette: {
        primary: { main: '#1976d2' },
      },
    },
    elGR, // x-data-grid translations
    // pickersElGR, // x-date-pickers translations
    coreElGR, // core translations
  );
  
  // Rendered more hooks than during the previous render with custom hook
  const tableToShow = (
    <div style={{ height: 500, width: '100%' }}>
    <ThemeProvider theme={theme}>
      <DataGrid
        rows={deposits}
        columns={columns}
        experimentalFeatures={{ newEditingApi: true }}
        // onRowClick={handleEvent}
        components={{ Toolbar: CustomToolbar }}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[10, 25, 50, 100]}
        pagination
        autoHeight={true}
        isRowSelectable={(params: GridRowParams) => false}
        // componentsProps={{
        //   pagination: {
        //     labelRowsPerPage: "Στοιχεία ανά σελίδα"
        //   }
        // }}
      /></ThemeProvider>
    </div> 
  )
  
  const hasDeposits = deposits && Object.keys(deposits).length > 0

  const profileNotCompleted = !user.name_el || !user.name_en ||
    !user.surname_el || !user.surname_en ||
    !user.father_name_el || !user.father_name_en;

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
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Προσοχή!</AlertTitle>
          Σύμφωνα με τη Γραμματεία του τμήματός σας δεν έχετε δικαίωμα υποβολής εργασίας.
          Επικοινωνήστε μαζί της ώστε να επιλύσετε το θέμα.
        </Alert>
      )}
      { !user.is_superuser && profileNotCompleted && ( 
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Δεν έχετε ολοκληρωμένο προφίλ!</AlertTitle>
            Η δημιουργία απόθεσης
            προϋποθέτει τη συμπλήρωση <strong>όλων των πεδίων</strong> που
            περιλαμβάνει το προφίλ σας.
        </Alert>
      )}
      { !user?.is_superuser && canAddNewDeposit && !profileNotCompleted && (
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
