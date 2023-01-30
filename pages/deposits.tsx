import * as React from 'react';
import router from 'next/router'
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from "@prisma/client"
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
  GridInitialState,
  GridColumnVisibilityModel,
  getGridNumericOperators,
  getGridStringOperators,
  useGridApiContext,
  elGR,
} from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { elGR as pickersElGR } from '@mui/x-date-pickers';
import { elGR as coreElGR } from '@mui/material/locale';
import Grid from "@mui/material/Grid";

const stringToBoolean = (s: string | null | undefined): boolean => {
  return !!s
}

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
      name_el: string | null;
      surname_el: string | null;
      department: string | null;
      title: string | null;
    }
    submitter_fullname?: string | null;
    submitter_fullname_ldap?: string | null;
    // submitter_department?: string | null;
    // submitter_title?: string | null;
  }

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

    const depositMeta = {
      unconfirmedCount,
      addNewCount,
      canAddNewDeposit
    }

  return {
    props : { user, depositMeta }
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
      {/* <Grid>
        <GridToolbarQuickFilter />
      </Grid> */}
    </GridToolbarContainer>
  );
}

const Deposits = ((
  { user, depositMeta }: InferGetServerSidePropsType<typeof getServerSideProps>,
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
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
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
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'abstract_el',
      headerName: 'Περίληψη',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'abstract_en',
      headerName: 'Περίληψη (Αγγλικά)',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'keywords_el',
      headerName: 'Λέξεις κλειδιά',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'keywords_en',
      headerName: 'Λέξεις κλειδιά (Αγγλικά)',
      headerAlign: 'center',
      width: 350,
      editable: false,
      hide: true,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'submitter_fullname',
      headerName: 'Δημιουργός',
      headerAlign: 'center',
      width: 250,
      hide: !user?.is_superuser,
      editable: false,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'submitter_fullname_ldap',
      headerName: 'Δημιουργός (LDAP)',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'submitter.email',
      headerName: 'Email Δημιουργού',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      valueGetter: (params) => params.row.submitter.email,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'submitter_department',
      headerName: 'Τμήμα',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      // valueGetter: (params) => params.row.submitter.department,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'submitter_title',
      headerName: 'Τίτλος χρήστη',
      headerAlign: 'center',
      width: 250,
      hide: true,
      editable: false,
      // valueGetter: (params) => params.row.submitter.title,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'language',
      headerName: 'Γλώσσα',
      headerAlign: 'center',
      width: 120,
      hide: true,
      editable: false,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    {
      field: 'confirmed',
      headerName: 'Επιβεβαιωμένη',
      headerAlign: 'center',
      width: 120,
      type: 'boolean',
      editable: false,
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
    },
    {
      field: 'confirmed_timestamp',
      headerName: 'Ημερομηνία Επιβεβαίωσης',
      headerAlign: 'center',
      width: 300,
      type: 'dateTime',
      filterable: false,
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
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },  
    {
      field: 'date_created',
      headerName: 'Ημερομηνία Δημιουργίας',
      headerAlign: 'center',
      width: 300,
      hide: true,
      type: 'dateTime',
      filterable: false,
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
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
    },
    {
      field: 'images',
      headerName: 'Εικόνες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
    },
    {
      field: 'tables',
      headerName: 'Πίνακες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
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
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
    },
    {
      field: 'maps',
      headerName: 'Χάρτες',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
    },
    {
      field: 'drawings',
      headerName: 'Σχέδια',
      headerAlign: 'center',
      width: 70,
      type: 'number',
      hide: true,
      editable: false,
      filterOperators: getGridNumericOperators().filter(
        (operator) => operator.value !== 'isEmpty' && operator.value !== 'isNotEmpty' && operator.value !== 'isAnyOf',
      ),
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
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains' ||
        operator.value === 'equals' ||
        operator.value === 'startsWith' ||
        operator.value === 'endsWith'
      ),
    },
    
  ];

  interface columnVisibilityModelInterface {
    [key: string]: boolean
  }
  
  const columnVisibilityModel: columnVisibilityModelInterface = {}
  
  columns.forEach(x => {
      // if (x.hide) {
          columnVisibilityModel[x.field] = !x.hide;
      // }
  })

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

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageState(old => ({ ...old, pageSize: newPageSize }))
    sessionStorage.setItem(user.username + 'pagesize', JSON.stringify(newPageSize))
  }

  const localStoredPageSize = (typeof window !== 'undefined') &&
  JSON.parse(sessionStorage.getItem(user.username + 'pagesize')!) ?
    JSON.parse(sessionStorage.getItem(user.username + 'pagesize')!)
    :
    10;

  const defaultSort = {
    field: 'date_created',
    sort: 'desc',
  }
  const localStoredState = (typeof window !== 'undefined') &&
  JSON.parse(sessionStorage.getItem(user.username + 'gridstate')!) ?
    JSON.parse(sessionStorage.getItem(user.username + 'gridstate')!)
    :
    {
      columns: { columnVisibilityModel },
      sorting: {
        sortModel: [{ field: defaultSort.field, sort: defaultSort.sort }],
      },
      // filter: {
      //   filterModel: {}
      // }
    };
  
  const [pageSize, setPageSize] = React.useState<number>(localStoredPageSize)

  const [savedState, setSavedState] = React.useState<{
    // count: number;
    initialState: GridInitialState;
  }>({
    // count: 0,
    initialState:
      localStoredState,
  });

  const [pageState, setPageState] = React.useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize,
    field: localStoredState.initialState?.sorting?.sortModel[0].field || 'date_created',
    sort:  localStoredState.initialState?.sorting?.sortModel[0].sort || 'desc',
    filterColumnField: savedState.initialState.filter?.filterModel?.items[0].columnField,
    filterOperatorValue: savedState.initialState.filter?.filterModel?.items[0].operatorValue,
    filterValue: savedState.initialState.filter?.filterModel?.items[0].value,
  })

  React.useEffect(() => {
    const fetchData = async () => {
      setPageState(old => ({ ...old, isLoading: true }))

      const mapFrom = [ "=", "is", "!=", ">=", ">", "<=", "<", ];
      const mapTo = [ "equals", "equals", "not", "gte", "gt", "lte", "lt", ];
     
      const filterOperatorValue = !!pageState.filterOperatorValue ?
        pageState.filterOperatorValue.replace(new RegExp(mapFrom.join("|"),'gi'), x => {return mapTo[mapFrom.indexOf(x)]}) : '';

      // const { isLoading, data, total, ...fetchData } = pageState;
      // const qs = Object.keys(fetchData).reduce(function(_qs, k, i){ return _qs + '&' + k + '=' + fetchData[k as keyof typeof filterModel]; }, '').substring(1);
      const url = '/api/deposits?';
      const params = `page=${pageState.page}&limit=${pageState.pageSize}&sortby=${pageState.field}&sortorder=${pageState.sort}`;
      const filterParams = (!!pageState.filterColumnField && !!filterOperatorValue && !!pageState.filterValue) ?
        `&filtercolumnfield=${pageState.filterColumnField}&filteroperatorvalue=${filterOperatorValue}&filtervalue=${pageState.filterValue}` : '';
      const response = await fetch(url + params + filterParams)
      .then(response => {
        if(!response.ok) throw new Error(response.status as unknown as string);
        return response.json();
      })
      setPageState(old => ({ ...old, isLoading: false, data: response.data, total: response.total }))
    }
    fetchData()
  }, [pageState.page, pageState.pageSize, pageState.field, pageState.sort, pageState.filterColumnField, pageState.filterOperatorValue, pageState.filterValue])
  
  // https://github.com/abhidiwakar/mui_data_grid_ssp/blob/master/src/App.js


  // Rendered more hooks than during the previous render with custom hook
  const tableToShow = (
    <div style={{ height: 500, width: '100%' }}>
    <ThemeProvider theme={theme}>

      <DataGrid
        initialState={savedState.initialState}
        onStateChange={s => {
          // console.log(s)
          sessionStorage.setItem(user.username + 'gridstate', JSON.stringify(s))}}
        // onStateChange={s => console.log(s)}
        loading={pageState.isLoading}
        page={pageState.page - 1}
        rows={pageState.data}
        rowCount={pageState.total}
        columns={columns}
        experimentalFeatures={{ newEditingApi: true }}
        components={{ Toolbar: CustomToolbar }}
        pageSize={pageState.pageSize}
        paginationMode="server"
        onPageChange={newPage => {
          setPageState(old => ({ ...old, page: newPage + 1 }))
        }}
        onPageSizeChange={newPageSize => changePageSize(newPageSize)}
        onSortModelChange={newSortModel => {
          if (newSortModel[0]) {
            setPageState(old => ({ ...old, field: newSortModel[0].field, sort: newSortModel[0].sort! }))
          } else {
            setPageState(old => ({ ...old, field: defaultSort.field, sort: defaultSort.sort }))
          }
        }}
        filterMode="server"
        onFilterModelChange={x => {
          console.log(x)
          if (x.items && x.items.length == 1) {
            setPageState(old => ({ ...old, filterColumnField: x.items[0].columnField!, filterOperatorValue: x.items[0].operatorValue!, filterValue: x.items[0].value! }))
          } else {
            setPageState(old => ({ ...old, filterColumnField: '', filterOperatorValue: '', filterValue: '' })) 
          }
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        pagination
        autoHeight={true}
        isRowSelectable={(params: GridRowParams) => false}
      /></ThemeProvider>
    </div> 
  )

  // const hasDeposits = deposits && Object.keys(deposits).length > 0
  const hasDeposits = pageState.total > 0

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
      {/* { !hasDeposits && (
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Προσοχή!</AlertTitle>
          Δεν βρέθηκαν αποθέσεις
        </Alert>
      )} */}
      { !user?.is_superuser &&
        depositMeta.addNewCount === 0 && (
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Προσοχή!</AlertTitle>
          Σύμφωνα με τη Γραμματεία του τμήματός σας δεν έχετε δικαίωμα υποβολής εργασίας.
          Επικοινωνήστε μαζί της ώστε να επιλύσετε το θέμα.
        </Alert>
      )}
      { !user?.is_superuser &&
        depositMeta.unconfirmedCount > 0 && (
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Προσοχή!</AlertTitle>
          Υπάρχει μη επιβεβαιωμένη απόθεση που μπορείτε να επεξεργαστείτε.
        </Alert>
      )}    
      { !user.is_superuser && profileNotCompleted &&
        depositMeta.unconfirmedCount === 0 && ( 
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Δεν έχετε ολοκληρωμένο προφίλ!</AlertTitle>
            Η δημιουργία απόθεσης
            προϋποθέτει τη συμπλήρωση <strong>όλων των πεδίων</strong> που
            περιλαμβάνει το προφίλ σας.
        </Alert>
      )}
      { !user.is_superuser && profileNotCompleted &&
        depositMeta.unconfirmedCount > 0 && (  
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Δεν έχετε ολοκληρωμένο προφίλ!</AlertTitle>
            Η επιβεβαίωση της απόθεσης
            προϋποθέτει τη συμπλήρωση <strong>όλων των πεδίων</strong> που
            περιλαμβάνει το προφίλ σας.
        </Alert>
      )}
      { !user?.is_superuser && depositMeta.canAddNewDeposit && !profileNotCompleted && (
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
      {/* { hasDeposits && tableToShow } */}
      { tableToShow }
    </Layout>
  )

});

export default Deposits;