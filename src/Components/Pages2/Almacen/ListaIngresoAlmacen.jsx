import { makeStyles, Paper, Box, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid, TextField, InputAdornment, IconButton, Tooltip, Container, CircularProgress } from '@material-ui/core'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import SearchIcon from '@material-ui/icons/Search';
import PrintIcon from '@material-ui/icons/Print';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import sello from '../../../images/sello.png'

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '1rem'
    },
    styleTablehead: {
        color: 'white',
        backgroundColor: "black",
        align: 'center',
        fontSize: 'small',
        padding: 0,

    },
    tableRow: {
        "&:hover": {
            backgroundColor: "#bbdefb"
        }
    }
}))
const ListaIngresoAlmacen = () => {
    const classes = useStyles()
    const [ingresoAlmacen, setIngresoAlmacen] = useState([])
    const [progress, setProgress] = useState('none')
    const [exist, setExist] = useState('none')

    useEffect(() => {
        getIngresoAlmacen()
    }, [])

    //----------------GET INGRESO ALMACEN---------------------
    const getIngresoAlmacen = async () => {
        setProgress('block')
        try {
            const result = await ipcRenderer.invoke(`get-ingresoAlmacen`)
            .then(resp=>{
                if (JSON.parse(resp.length) === 0) {
                    setExist('block')
                }
                setProgress('none')
                setIngresoAlmacen(JSON.parse(resp))
                // setIngresoAlmacen(JSON.parse(result))
            })
        } catch (error) {
            console.log(error)
        }
    }
    //---------------------------BUSCADOR---------------------------------------------
    const [buscador, setBuscador] = useState("")

    const buscarIngresosAlmacen = (buscador) => {
        return function (x) {
            return x.numFactura.includes(buscador) ||
                x.numFactura.toLowerCase().includes(buscador) ||
                x.registerDate.includes(buscador) ||
                x.unidadMedida.toLowerCase().includes(buscador) ||
                x.unidadMedida.includes(buscador) ||
                x.nameSubMaterial.toLowerCase().includes(buscador) ||
                x.nameSubMaterial.includes(buscador) ||
                x.numeroIngreso.toLowerCase().includes(buscador) ||
                x.numeroIngreso.includes(buscador) ||
                x.codSubMaterial.toLowerCase().includes(buscador) ||
                x.codSubMaterial.includes(buscador) ||
                !buscador
        }

    }
    //--------------------------------------PDF GENERATE---------------------------------
    const pdfGenerate = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [14, 11] })
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()

        doc.setFontSize(15)
        doc.setFont('Courier', 'Bold');
        doc.addImage(`${sello}`, 0.5, 0.3, 1.5, 0.7)
        doc.text(`Ingreso de Materiales a Almacen`, pageWidth / 2, 1, 'center')
        doc.autoTable({
            headStyles: {
                fillColor: [50, 50, 50],
                cellPadding: 0.03
            },
            bodyStyles: {
                cellPadding: 0.01
            },
            head: [
                [
                    { content: 'Item Pedido', rowSpan: 2, styles: { halign: 'center', valign: 'middle', lineWidth: 0.01, cellWidth: 0.6 } },
                    { content: 'Registro N°', rowSpan: 2, styles: { halign: 'center', valign: 'middle', lineWidth: 0.01 } },
                    { content: 'Factura N°', rowSpan: 2, styles: { halign: 'center', valign: 'middle', lineWidth: 0.01, cellWidth: 0.6 } },
                    { content: 'Cantidad', colSpan: 2, styles: { halign: 'center', lineWidth: 0.01, cellWidth: 1 } },
                    { content: 'Unidad Medida', rowSpan: 2, styles: { halign: 'center', valign: 'middle', lineWidth: 0.01 } },
                    { content: 'Descripción', rowSpan: 2, styles: { halign: 'center', valign: 'middle', lineWidth: 0.01 } },
                    { content: 'Registro de Existencia', colSpan: 2, styles: { halign: 'center', lineWidth: 0.01 } },
                    { content: 'Fecha', rowSpan: 2, styles: { halign: 'center', valign: 'middle', lineWidth: 0.01 } },
                ],
                [
                    { content: 'Facturada', styles: { halign: 'center', lineWidth: 0.01, } },
                    { content: 'Recibida', styles: { halign: 'center', lineWidth: 0.01, } },
                    { content: 'kardex', styles: { halign: 'center', lineWidth: 0.01, } },
                    { content: 'Bs.', styles: { halign: 'center', lineWidth: 0.01, } },
                ]
            ],
            body: ingresoAlmacen.map((d, index) => ([
                { content: index + 1 },
                { content: d.numeroIngreso ? d.numeroIngreso : "", styles: { halign: 'center' } },
                { content: d.numFactura ? d.numFactura : "", styles: { halign: 'center' } },
                { content: d.cantidadF ? d.cantidadF : "", styles: { halign: 'right' } },
                { content: d.cantidadR ? d.cantidadR : "", styles: { halign: 'right' } },
                { content: d.unidadMedida ? d.unidadMedida : "", styles: { halign: 'center' } },
                { content: d.nameSubMaterial ? d.nameSubMaterial : "" },
                { content: d.codSubMaterial ? d.codSubMaterial : "", styles: { halign: 'center' } },
                { content: d.precio ? d.precio : "", styles: { halign: 'right' } },
                { content: d.registerDate ? d.registerDate : "", styles: { halign: 'center' } },
            ])),
            styles: { fontSize: 8, font: 'courier', fontStyle: 'bold' },
            startY: 1.3,
        })
        var pages = doc.internal.getNumberOfPages()
        for (var i = 1; i <= pages; i++) {
            var horizontalPos = pageWidth / 2
            var verticalPos = pageHeight - 0.2
            doc.setFontSize(8)
            doc.setPage(i)
            doc.text(`${i} de ${pages}`, horizontalPos, verticalPos, { align: 'center' })
        }
        window.open(doc.output('bloburi'))
    }
    //-----------------------------------------------------------
    //-----------------------------------------------------------
    //-----------------------------------------------------------
    // console.log(ingresoAlmacen)
    return (
        <>
            <Typography style={{ paddingTop: '2rem', marginBottom: '1rem', color: 'white' }} align='center' variant='h6'>INGRESOS ALMACEN</Typography>
            <Container maxWidth='lg'>
                <Grid container direction='row' justifyContent='flex-end' alignItems='center' style={{ marginBottom: '0.5rem' }}>
                    <div>
                        {ingresoAlmacen &&
                            <TextField
                                style={{ background: 'white', borderRadius: 5, marginRight: '1rem' }}
                                variant='outlined'
                                size='small'
                                InputProps={{
                                    startAdornment: (
                                        <>
                                            <Typography variant='subtitle1' style={{ marginRight: '0.5rem' }}>Buscar</Typography>
                                            <InputAdornment position='start'>
                                                <SearchIcon />
                                            </InputAdornment>
                                        </>
                                    )
                                }}
                                onChange={e => setBuscador(e.target.value)}
                            />
                        }
                        <IconButton
                            component="span"
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                                marginRight: '0.5rem',
                            }}
                            onClick={pdfGenerate}>
                            <Tooltip title='imprimir'>
                                <PrintIcon />
                            </Tooltip>
                        </IconButton>
                        <IconButton
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #0277bd 30%, #82b1ff 90%)',
                                marginRight: '0.5rem',
                            }}
                            component={Link}
                            to="/listaAlmacen">
                            <Tooltip title='atras'>
                                <ArrowBackIcon />
                            </Tooltip>
                        </IconButton>
                    </div>
                </Grid>
                {/* --------------------------------------------------------------------------- */}
                <Paper component={Box} p={1}>
                    <TableContainer style={{ maxHeight: 450 }}>
                        <Table id='id-table' stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center'>Item del Pedido</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center'>N° Registro</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center'>N° Factura</TableCell>
                                    <TableCell className={classes.styleTablehead} colSpan='2' align='center'>Cantidad</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center'>Unidad</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center'>Descripcion</TableCell>
                                    <TableCell className={classes.styleTablehead} colSpan='2' align='center'>Registro de Existencia</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center'>Fecha</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} align='center'>Facturada</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Recibida</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>kardex</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Bs</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ingresoAlmacen.length > 0 ? (
                                    ingresoAlmacen.filter(buscarIngresosAlmacen(buscador)).map((i, index) => (
                                        <TableRow key={index} className={classes.tableRow}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell align='center'>{i.numeroIngreso}</TableCell>
                                            <TableCell align='center'>{i.numFactura}</TableCell>
                                            <TableCell align='right'>{i.cantidadF}</TableCell>
                                            <TableCell align='right'>{i.cantidadR}</TableCell>
                                            <TableCell align='center'>{i.unidadMedida}</TableCell>
                                            <TableCell>{i.nameSubMaterial}</TableCell>
                                            <TableCell align='center'>{i.codSubMaterial}</TableCell>
                                            <TableCell align='right'>{i.precio}</TableCell>
                                            <TableCell align='center'>{i.registerDate}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell align='center'colSpan='9' style={{ display: progress }}>
                                            <CircularProgress />
                                            {/* <LinearProgress /> */}
                                        </TableCell>
                                        <TableCell style={{ display: exist }} colSpan='9' align='center'>no existen datos</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </>
    )
}

export default ListaIngresoAlmacen
