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

// Fetch deposits of current user
export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  const user: any = req.session.user;

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        // user: { id: null, email: null, username: null, isLoggedIn: false, }, //as User,
        deposits: {}, unconfirmedCount: 0, addNewCount: 0
      },
    };
  }

  // if (user?.is_superuser) {
  //   res.setHeader("location", "/deposits");
  //   res.statusCode = 302;
  //   res.end();
  //   return {
  //     props: {
  //       deposits: {}
  //     },
  //   };
  // }
  
  const prisma = new PrismaClient()

  const deposits = user.is_superuser?
  (await prisma.deposit.findMany())
  :
  (await prisma.deposit.findMany({
    where: {
      submitter_id: user.id || undefined,
    }
  }))

  const unconfirmedCount = (await prisma.deposit.aggregate({
    where: {
      submitter_id: user.id || undefined,
      confirmed: false,
    },
    _count: {
      confirmed: true,
    },
  }))._count.confirmed || 0

  // https://github.com/prisma/prisma/discussions/11443
  const addNewCount = (await prisma.permission.aggregate({
    where: {
      submitter_email: user.email,
      due_to: {
        gte: new Date(),
        // gte: new Date('2022-12-26'),
      },
    },
    _count: {
      _all: true
    }
  }))._count._all || 0

  return {
    // props : { deposits }
    props : { deposits, unconfirmedCount, addNewCount }
    // props : { user, deposits }
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
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'title_el',
    numeric: false,
    disablePadding: false,
    label: 'Τίτλος',
  },
  {
    id: 'title_en',
    numeric: false,
    disablePadding: false,
    label: 'Τίτλος (Αγγλικά)',
  },
  {
    id: 'pages',
    numeric: true,
    disablePadding: false,
    label: 'Σελίδες',
  },
  {
    id: 'confirmed',
    numeric: true,
    disablePadding: false,
    label: 'Επικυρωμένη',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

function EnhancedTable(rows: Data[]) {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('confirmed');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.sort(getComparator(order, orderBy)).slice() */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id as unknown as string);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell
                        onClick={() => router.push('/deposit/'+row.id)}
                        component="th"
                        id={labelId}
                        scope="row"
                        sx={{cursor: 'pointer', fontWeight: row.confirmed? 'plain' : 'bold'}}
                      ><HtmlTooltip
                      title={
                        <React.Fragment>
                          {/* https://mui.com/material-ui/react-tooltip/ */}
                          {row.supervisor !== null ? "Επιβλέπων: " : ""}
                          <Typography color="inherit">
                            {row.supervisor !== null ? row.supervisor : ""}
                          </Typography>
                          <u>{row.confirmed_timestamp !== null ? "Confirmation timestamp: "+row.confirmed_timestamp : ""}</u>
                          Εικόνες: {row.images}, Πίνακες: {row.tables},
                          Διαγράμματα: {row.diagrams}, Χάρτες: {row.maps},
                          Σχέδια: {row.drawings}
                          
                        </React.Fragment>
                      }
                    ><div>{row.title_el}</div></HtmlTooltip></TableCell>
                      <TableCell
                        onClick={() => router.push('/deposit/'+row.id)}
                        align="left"
                        sx={{cursor: 'pointer', fontWeight: row.confirmed? 'plain' : 'bold'}}>{row.title_en}</TableCell>
                      <TableCell
                        align="right"
                        sx={{fontWeight: row.confirmed? 'plain' : 'bold'}}>{row.pages}</TableCell>
                      <TableCell
                        align="right"
                        sx={{fontWeight: row.confirmed? 'plain' : 'bold'}}>{row.confirmed ? "Ναι" : "Όχι" }</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Show pagging options if rows are greater than n */}
        { rows.length > 0 ? 
        (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        )
        :
        (<></>)
        }
        
      </Paper>
    </Box>
  );
}


// Display list of deposits or error message
// function DepositsPage(
//   { user, deposits }:
//   {
//     user: InferGetServerSidePropsType<typeof getServerSideProps>,
//     deposits: any[]
//   }
//   ) {
export default ((
  {deposits, unconfirmedCount, addNewCount }:
    {deposits: any[], unconfirmedCount: number, addNewCount: number },
  ) => {
  // Rendered more hooks than during the previous render with custom hook
  const tableToShow = EnhancedTable(deposits);

  const { user } = useUser({
    // redirectTo: "/login",
  });

  const canAddNewDeposit = !user?.is_superuser && unconfirmedCount < addNewCount;

  // use deposits page for all user types
  // if (!user || user.is_superuser)
  //   return(<></>);

  const getHeadings = () => {
    return Object.keys(deposits[0]);
  }
  
  const hasDeposits = deposits && Object.keys(deposits).length > 0

  // console.log(deposits);
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
