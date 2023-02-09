import React from "react";
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { User } from "pages/api/user";
import { InferGetServerSidePropsType } from "next";
import { PrismaClient } from '@prisma/client'
import router from 'next/router'
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { visuallyHidden } from '@mui/utils';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

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

  if (!user?.isSecretary) {
    res.setHeader("location", "/profile");
    res.statusCode = 302;
    res.end();
  }

  const prisma = new PrismaClient()
                
  interface Permission {
    secretary: {
      first_name: string | null;
      last_name: string | null;
    }
    secretary_fullname?: string | null;
    submitter_email: string;
    submitter_fullname?: string | null;
  }

  interface Submitter {
    first_name: string | null;
    last_name: string | null;
    email: string;
    submitter_fullname?: string | null;
  }
  
  const permissions: Permission[] = await prisma.permission.findMany({
    include: {
      secretary: {
        select: {
          first_name: true,
          last_name: true,
        }
      }
    }
  })

  const submitter_emails: string[] = [];
  permissions.forEach(({submitter_email: v}) => submitter_emails.push(v))

  const submitters: Submitter[] = await prisma.user.findMany({
    where: {
      email: { in: submitter_emails },
    },
    select: {
      email: true,
      first_name: true,
      last_name: true,
    }
  })

  submitters.map((x) => {
    x.submitter_fullname = x.last_name + ' ' + x.first_name;
    return x;
  })

  permissions.map((x) => {
    x.secretary_fullname = x.secretary.last_name + ' ' + x.secretary.first_name;
    x.submitter_fullname = submitters.find(y => x.submitter_email == y.email)?.submitter_fullname || ''
  });

  return {
    props : { user, permissions: JSON.parse(JSON.stringify(permissions)) }
  }

}, sessionOptions);

interface Data {
  id: number;
  submitter_email: string;
  due_to: string;
  secretary_id: number;
  secretary_fullname: string;
  submitter_fullname: string;
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
    id: 'submitter_email',
    numeric: false,
    disablePadding: false,
    label: 'E-mail',
  },
  {
    id: 'submitter_fullname',
    numeric: false,
    disablePadding: false,
    label: 'Δημιουργός',
  },
  {
    id: 'due_to',
    numeric: true,
    disablePadding: false,
    label: 'Καταληκτική ημερομηνία',
  },
  {
    id: 'secretary_fullname',
    numeric: true,
    disablePadding: false,
    label: 'Υπεύθυνος/η Γραμματείας',
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

function EnhancedTable(rows: Data[], user: any) {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('due_to');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
                  const rowDate = new Date(row.due_to).toLocaleDateString('el');
                  const owned = row.secretary_id == user?.id;
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
                        onClick={() => router.push('/permission/'+row.id)}
                        component="th"
                        id={labelId}
                        scope="row"
                        sx={{cursor: 'pointer', fontWeight: !owned? 'plain' : 'bold'}}
                      >{row.submitter_email}</TableCell>
                      <TableCell
                        sx={{fontWeight: !owned? 'plain' : 'bold'}}
                        >{row.submitter_fullname}</TableCell>
                      <TableCell
                        align="right"
                        sx={{fontWeight: !owned? 'plain' : 'bold'}}
                        >{rowDate.toString()}</TableCell>
                      <TableCell
                        align="right"
                        sx={{fontWeight: !owned? 'plain' : 'bold'}}
                        >{row.secretary_fullname}</TableCell>
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
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Γραμμές ανά σελίδα"
        />
        )
        :
        (<></>)
        }
        
      </Paper>
    </Box>
  );
}

const DepositPermissions = ((
  { user, permissions }: InferGetServerSidePropsType<typeof getServerSideProps>,
  ) => {

  const tableToShow = EnhancedTable(permissions, user);
  
  const hasPermissions = permissions && Object.keys(permissions).length > 0
  
  if (!user || !(user.isSecretary))
    return(<></>);

  return (
    <Layout>
      <h1>Διαχείριση δικαιωμάτων αυτοαπόθεσης</h1>
      { !hasPermissions && (
        <Alert severity="warning" sx={{ m: 1 }}>
          <AlertTitle>Προσοχή!</AlertTitle>
          Δεν βρέθηκαν εγγραφές δικαιωμάτων.
        </Alert>
      )
      }
      <Box sx={{ '& > button': { m: 1 } }}>
          <Button
              color="secondary"
              onClick={() => router.push('/permission/new')}
              startIcon={<AddCircleOutlineIcon />}
              variant="contained"
            >
              δημιουργια νεας εγγραφης δικαιωματων
            </Button>
        </Box>
      { hasPermissions && tableToShow }
    </Layout>
  )

});

export default DepositPermissions;