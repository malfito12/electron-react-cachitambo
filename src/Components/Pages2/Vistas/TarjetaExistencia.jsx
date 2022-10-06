import { Container, Box, makeStyles, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Grid, TextField, InputAdornment, IconButton, Tooltip, CircularProgress } from '@material-ui/core'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import SearchIcon from '@material-ui/icons/Search';
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import sello from '../../../images/sello.png'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PrintIcon from '@material-ui/icons/Print';
import { useHistory, useLocation } from 'react-router-dom';

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
const TarjetaExistencia = (props) => {
    const { history } = props
    const location=useLocation()
    const classes = useStyles()
    // console.log(props)
    var aux = props.location.pathname
    aux = aux.split("/")
    // console.log(aux)
    const [tarjeta, setTarjeta] = useState([])
    const [progress, setProgress] = useState('none')
    const [exist, setExist] = useState('none')

    useEffect(() => {
        getTarjeta()
    }, [])

    //--------------------GET TARJETA--------------------------------
    const getTarjeta = async () => {
        setProgress('block')
        try {
            const result = await ipcRenderer.invoke("get-tarjetaExistencia", aux[4])
                .then(resp => {
                    if (JSON.parse(resp.length) === 0) {
                        setExist('block')
                    }
                    setProgress('none')
                    setTarjeta(JSON.parse(resp))
                    // setTarjeta(JSON.parse(result))
                })
        } catch (error) {
            console.log(error)
        }
    }
    //------------------------BUSCADOR------------------------------
    const [buscador, setBuscador] = useState("")
    const buscarInfoTarjeta = (buscador) => {
        try {
            // return function(x){
            //     var fecha=x.numeroIngreso;
            //     console.log(fecha)
            //     // if(x.registerDate){
            //     //     fecha=x.registerDate.includes()
            //     // }
            //     // return fecha || !buscador
            // }
            return function (x) {
                return x.registerDate.includes(buscador) ||
                    x.numeroIngreso.toLowerCase().includes(buscador) ||
                    x.numeroIngreso.includes(buscador) ||
                    x.saldoExistencia.includes(buscador) ||
                    !buscador
            }
        } catch (error) {

        }
    }
    //---------------------------PDF GENERATE-------------------------
    const pdfGenerate = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [11, 7] })
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()

        doc.setFontSize(15)
        doc.setFont('Courier', 'Bold');
        doc.addImage(`${sello}`, 0.5, 0.3, 1.5, 0.7)
        doc.text(`Tarjeta de Existencia`, pageWidth / 2, 1, 'center')
        doc.setFontSize(9)
        doc.text(`Kadex N°:   ${aux[4]}`, 1, 1.35)
        doc.text(`Unidad:   ${aux[7]}`, 4, 1.35)
        doc.text(`Articulo:   ${location.data.nameSubMaterial}`, 1, 1.45)
        doc.text(`Stock Minimo :   ${aux[6]}`, 1, 1.55)
        // doc.autoTable({ html: "#id-table", styles: { fontSize: 9 }, margin: { top: 55 } })
        doc.autoTable({
            headStyles: {
                fillColor: [50, 50, 50]
            },
            bodyStyles: {
                cellPadding: 0.01
            },
            head: [[
                { content: 'N°' },
                { content: 'Fecha', styles: { halign: 'center' } },
                { content: 'Pedido Vale N°', styles: { halign: 'center' } },
                { content: 'Ingreso N°', styles: { halign: 'center' } },
                { content: 'Seccion', styles: { halign: 'center' } },
                { content: 'Entradas', styles: { halign: 'center' } },
                { content: 'Salidas', styles: { halign: 'center' } },
                { content: 'Saldo Existencia', styles: { halign: 'center' } },
            ]],
            body: tarjeta.map((d, index) => ([
                { content: index + 1 },
                { content: d.registerDate, styles: { halign: 'center' } },
                { content: d.numVale ? d.numVale : ' ' },
                { content: d.numeroIngreso },
                { content: d.seccion ? d.seccion : ' ' },
                { content: d.cantidadF ? d.cantidadF : ' ', styles: { halign: 'right' } },
                { content: d.cantidadS ? d.cantidadS : ' ', styles: { halign: 'right' } },
                { content: d.saldoExistencia, styles: { halign: 'right' } },
            ])),
            styles: { fontSize: 8, font: 'courier', fontStyle: 'bold' },
            startY: 1.7,
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
    //--------------------------------------------------------------
    const irAtras = () => {
        // history.push(`/listaSubmateriales/${aux[2]}/${aux[3]}`)
        history.push({
            pathname: '/listaSubmateriales/' + location.data.codMaterial + '/' + location.data.nameMaterial,
            data: { code: location.data.codMaterial, nameMaterial: location.data.nameMaterial },
            search: '?update=true',
            state: { update: true }
        })

    }
    //--------------------------------------------------------------
    //--------------------------------------------------------------
    //--------------------------------------------------------------
    //--------------------------------------------------------------
    // console.log(tarjeta)
    return (
        <>
            <Container maxWidth='md' style={{ marginBottom: '1rem', paddingTop: '2rem' }}>
                <Paper component={Box} p={1}>
                    <Typography variant='h5' align='center'>TARJETA DE EXISTENCIA {aux[5]}</Typography>
                    <Grid container spacing={3} >
                        <Grid item xs={12} sm={6}>
                            <Typography>Kardex N°: {aux[4]}</Typography>
                            <Typography>Articulo: {location.data.nameSubMaterial}</Typography>
                            <Typography>Stock Minino: {aux[6]} "saldo inicio"</Typography>

                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography>Unidad: {aux[7]}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            <Container maxWidth='lg'>
                <Grid container direction='row' justifyContent='flex-end' alignItems='center' style={{ marginBottom: '0.5rem' }}>
                    {tarjeta &&
                        <TextField
                            style={{ background: 'white', borderRadius: 5, marginRight: '1rem' }}
                            variant='outlined'
                            size='small'
                            // fullWidth
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
                        onClick={irAtras}
                        to="/listaProduct">
                        <Tooltip title='atras'>
                            <ArrowBackIcon />
                        </Tooltip>
                    </IconButton>
                </Grid>
                {/* ------------------------------------------------------------------------ */}

                <Paper component={Box} p={0.3}>
                    <TableContainer style={{ maxHeight: 450 }}>
                        <Table id='id-table' style={{ minWidth: 1000 }} border='1' stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} align='center'>Fecha</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Pedido de Vale N°</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Ingreso N°</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Seccion</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Entradas</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Salidas</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Saldo en Existecia</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tarjeta.length > 0 ? (
                                    tarjeta.filter(buscarInfoTarjeta(buscador)).map((t, index) => (
                                        <TableRow key={index} className={classes.tableRow}>
                                            <TableCell>{t.registerDate}</TableCell>
                                            <TableCell>{t.numVale}</TableCell>
                                            <TableCell>{t.numeroIngreso}</TableCell>
                                            <TableCell>{ }</TableCell>
                                            <TableCell align='right'>{t.cantidadF}</TableCell>
                                            <TableCell align='right'>{t.cantidadS}</TableCell>
                                            <TableCell align='right'>{t.saldoExistencia}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell align='center' colSpan='7' style={{ display: progress }}>
                                            <CircularProgress />
                                            {/* <LinearProgress /> */}
                                        </TableCell>
                                        <TableCell style={{ display: exist }} colSpan='7' align='center'>no existen datos</TableCell>
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

export default TarjetaExistencia
