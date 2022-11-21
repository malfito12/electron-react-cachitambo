import { Container, Box, makeStyles, Paper, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Grid, InputAdornment, TextField, Tooltip, IconButton, CircularProgress, Button, Dialog, InputLabel } from '@material-ui/core'
import React, { useState, useEffect } from 'react'
import SearchIcon from '@material-ui/icons/Search';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import sello from '../../../images/sello.png'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PrintIcon from '@material-ui/icons/Print';
import SaveIcon from '@material-ui/icons/Save';
import { useLocation, useHistory } from 'react-router-dom';
import { ErrorAlertsSalidas, SuccessAlertsSalidas } from '../../Atoms/Alerts/Alerts';

const ipcRenderer = window.require('electron').ipcRenderer

const KardexValorado = (props) => {
    // const { history } = props
    const classes = useStyles()
    const location = useLocation()
    // console.log(location)
    const history = useHistory()
    var aux = history.location.pathname
    // console.log(aux)
    aux = aux.split("/")
    // console.log(aux)
    const [kardex, setKardex] = useState([])
    const [progress, setProgress] = useState('none')
    const [exist, setExist] = useState('none')
    const [openModalSalida, setOpenModalSalida] = useState(false)
    const [changeData, setChangeData] = useState({
        typeRegister: 'salida',
        cantidadS: '',
        precioS: '',
        // precioUnitario: '',
        procedenciaDestino: '',
        registerDate: '',
        numVale: '',
        nameMaterial: aux[3],
        nameSubMaterial: aux[5],
        unidadMedida: aux[7],
        codMaterial: aux[2],
        codSubMaterial: aux[4]
    })
    const removeChangeData = {
        typeRegister: 'salida',
        cantidadF: '',
        precio: '',
        // precioUnitario: '',
        procedenciaDestino: '',
        unidadMedida: '',
        registerDate: '',
        numVale: '',
    }
    useEffect(() => {
        getKardex()
    }, [])

    //--------------GET KARDEX VALORADO------------------------------------
    const getKardex = async () => {
        setProgress('block')
        try {
            // const result = await ipcRenderer.invoke("get-kardexValorado", aux[4])
            const result = await ipcRenderer.invoke("get-kardex-valorado", aux[4])
                .then(resp => {
                    if (JSON.parse(resp.length) === 0) {
                        setExist('block')
                    }
                    setProgress('none')
                    setKardex(JSON.parse(resp))
                    // setKardex(JSON.parse(result))
                })
        } catch (error) {
            console.log(error)
        }
    }
    //---------------------------BUSCADOR---------------------------------------------
    const [buscador, setBuscador] = useState("")

    const buscarInfoKardex = (buscador) => {
        return function (x) {
            return x.registerDate.includes(buscador) ||
                x.procedenciaDestino.toLowerCase().includes(buscador) ||
                x.procedenciaDestino.includes(buscador) ||
                x.precioUnitario.includes(buscador) ||
                !buscador
        }
    }
    //---------------------------GENERAR PDF---------------------------------------------
    const pdfGenerate = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [14, 11] })
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()

        doc.setFontSize(16)
        doc.setFont('Courier', 'Bold');
        doc.addImage(`${sello}`, 0.5, 0.3, 1.5, 0.7)
        doc.text(`Tajeta de Existencia Kardex valorado`, pageWidth / 2, 1, 'center')
        doc.setFontSize(13)
        doc.text(`N°: ${aux[4]}`, 10, 1.2)
        doc.text(`Aticulo: ${aux[5]}`, 3, 1.4)
        doc.text(`Sector: INGENIO CACHITAMBO`, 3, 1.6)
        doc.text(`Unidad :  ${aux[6]}`, 9, 1.4)
        doc.autoTable({
            headStyles: {
                fillColor: [50, 50, 50]
            },
            bodyStyles: {
                cellPadding: 0.01
            },

            head: [
                [
                    { content: '', colSpan: 3, styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Entradas', colSpan: 2, styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Salidas', colSpan: 2, styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Saldos', colSpan: 2, styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Precio Unitario', rowSpan: 2, styles: { lineWidth: 0.01, halign: 'center', valign: 'middle' } },
                ],
                [
                    { content: 'Fecha', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Nota de Remision M.R.V.S.V.C.', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Procedencia - Destino', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Cantidad', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Valor Bs.', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Cantidad', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Valor Bs.', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Cantidad', styles: { lineWidth: 0.01, halign: 'center' } },
                    { content: 'Valor Bs.', styles: { lineWidth: 0.01, halign: 'center' } },
                ]
            ],
            body: kardex.map((d) => ([
                { content: d.registerDate },
                { content: d.notaRemision ? d.notaRemision : '', styles: { halign: 'center' } },
                { content: d.procedenciaDestino ? d.procedenciaDestino : '' },
                { content: d.cantidadE ? d.cantidadE : '', styles: { halign: 'right' } },
                { content: d.precioE ? d.precioE : '', styles: { halign: 'right' } },
                { content: d.cantidadS ? d.cantidadS : '', styles: { halign: 'right' } },
                { content: d.precioS ? d.precioS : '', styles: { halign: 'right' } },
                { content: d.cantidadTotal ? d.cantidadTotal : '', styles: { halign: 'right' } },
                { content: d.precioTotal ? d.precioTotal : '', styles: { halign: 'right' } },
                { content: d.precioUnitario ? d.precioUnitario : '', styles: { halign: 'right' } },
            ])),
            styles: { fontSize: 10, font: 'courier', fontStyle: 'bold' },
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
        // doc.save('ListaMateriales.pdf')

    }
    //-------------------------------------------------------------------
    const irAtras = () => {
        // history.push(`/listaSubmateriales/${aux[2]}/${aux[3]}`)
        history.push({
            pathname: '/listaSubmateriales/' + location.data.codMaterial + '/' + location.data.nameMaterial,
            data: { code: location.data.codMaterial, nameMaterial: location.data.nameMaterial },
            search: '?update=true',
            state: { update: true }
        })
    }
    //-----------------------REGISTER SALIDA SUB-MATERIALES--------------------------------------
    const openModalSalidaMaterial = () => {
        setOpenModalSalida(true)
    }
    const closeModalSalidaMaterial = () => {
        setOpenModalSalida(false)
        setChangeData(removeChangeData)
    }
    //----------------------------REGISTRAR SALIDA DE MATERIALES-----------------------------------
    const postSalidas = async (e) => {
        e.preventDefault()
        if (kardex.length > 0) {
            const num=kardex.length
            const precioU=parseFloat(kardex[num-1].precioTotal)
            const cantidadU=parseFloat(kardex[num-1].cantidadTotal)
            if(precioU<changeData.precioS ||cantidadU<changeData.cantidadS ){
                return openCloseAlertError()
            }
            var date = changeData.registerDate.split("-")
            var fecha = date[2] + '-' + date[1] + '-' + date[0]
            const data = {
                typeRegister: 'salida',
                cantidadS: changeData.cantidadS,
                precioS: changeData.precioS,
                // precioUnitario: changeData.precioUnitario,
                procedenciaDestino: changeData.procedenciaDestino,
                registerDate: fecha,
                numVale: changeData.numVale,
                nameMaterial: location.data.nameMaterial,
                nameSubMaterial: location.data.nameSubMaterial,
                unidadMedida: location.data.unidadMedida,
                codMaterial: location.data.codMaterial,
                codSubMaterial: location.data.codSubMaterial,
                idAlmacen: uuidv4()
            }
            await ipcRenderer.invoke('post-salidas', data)
                .then(resp => {
                    // console.log(JSON.parse(resp))
                    closeModalSalidaMaterial()
                    getKardex()
                    openCloseAlertSuccess()
                    setChangeData(removeChangeData)
                })
                .catch(err => console.log(err))

        } else {
            closeModalSalidaMaterial()
            setChangeData(removeChangeData)
            alert('No se puede registrar salidas por que no se cuenta con ningun ingreso')
        }
    }
    const [prueba, setPrueba] = useState([])
    const getPrueba = async () => {
        await ipcRenderer.invoke('prueba-get-1')
            .then(resp => setPrueba(JSON.parse(resp)))
            .catch(err => console.log(err))
    }
    const [openPrueba, setOpenPrueba] = useState(false)
    const openModalPrueba = (e) => {
        var date = e.registerDate.split("-")
        var fecha = date[2] + '-' + date[1] + '-' + date[0]
        setChangeData({
            ...e,
            registerDate: fecha
        })

        setOpenPrueba(true)
    }
    const closeModalPrueba = () => {
        setChangeData(removeChangeData)
        setOpenPrueba(false)
    }
    // const editPrueba=()=>{

    // }
    //----------------------------HANDLE CHANGE-----------------------------------
    const [openAlertSuccess, setOpenAlertSuccess] = useState(false)
    const [openAlertError, setOpenAlertError] = useState(false)
    const handleChage = (e) => {
        setChangeData({
            ...changeData,
            [e.target.name]: e.target.value
        })
    }
    //----------------------------------------------------
    const openCloseAlertSuccess = () => {
        setOpenAlertSuccess(!openAlertSuccess)
    }
    const openCloseAlertError = () => {
        setOpenAlertError(!openAlertError)
    }
    // console.log(kardex)
    return (
        <>
            <Container maxWidth='md' style={{ paddingTop: '2rem', marginBottom: '1rem' }}>
                <Paper component={Box} p={1}>
                    <Typography variant='h5' align='center'>Tarjeta de Existencia Kardex Valorado</Typography>
                    <Grid container >
                        {/* <Grid item xs={12} sm={6}>
                            <Typography>N°: {aux[4]} </Typography>
                            <Typography>Articulo: {aux[5]}</Typography>
                            <Typography>Sector: INGENIO CACHITAMBO</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography>Almacen de: CACHITAMBO</Typography>
                            <Typography>Saldo: {aux[6]}</Typography>
                            <Typography>Unidad Medida: {aux[7]}</Typography>
                        </Grid> */}
                        <Grid item xs={12} sm={6}>
                            <Typography>N°: {location.data.codMaterial} </Typography>
                            <Typography>Articulo: {location.data.nameSubMaterial}</Typography>
                            <Typography>Sector: INGENIO CACHITAMBO</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography>Almacen de: CACHITAMBO</Typography>
                            <Typography>Saldo: {location.data.saldoInicial}</Typography>
                            <Typography>Unidad Medida: {location.data.unidadMedida}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            <Container maxWidth='lg'>
                <Grid container direction='row' justifyContent='flex-end' alignItems='center' style={{ marginBottom: '0.5rem' }}>
                    <Button
                        onClick={openModalSalidaMaterial}
                        variant='contained'
                        style={{
                            marginRight: 10,
                            background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                            color: 'white'
                        }}>Registrar</Button>
                    {kardex &&
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
                <Paper component={Box} p={0.3}>
                    <TableContainer style={{ maxHeight: 450 }}>
                        <Table border='1' id='id-table' style={{ minWidth: 1000 }} stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} align='center' colSpan='3'></TableCell>
                                    <TableCell className={classes.styleTablehead} align='center' colSpan='2'>Entradas</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center' colSpan='2'>Salidas</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center' colSpan='2'>Saldos</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center' rowSpan='2'>Precio Unitario</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} align='center'>Fecha</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>nota de remision M.R.V.S.V.C</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Procedencia o Destino</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Cantidad</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Valor Bs.</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Cantidad</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Valor Bs.</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Cantidad</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Valor Bs.</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {kardex.length > 0 ? (
                                    kardex.filter(buscarInfoKardex(buscador)).map((k, index) => (
                                        <TableRow key={index} className={classes.tableRow}>
                                            {/* <TableCell>{k.registerDate}</TableCell>
                                            <TableCell align='center'>{k.numeroIngreso}</TableCell>
                                            <TableCell>{k.procedenciaDestino}</TableCell>
                                            <TableCell align='right'>{k.cantidadF}</TableCell>
                                            <TableCell align='right'>{k.precio}</TableCell>
                                            <TableCell align='right'>{k.cantidadS}</TableCell>
                                            <TableCell align='right'>{k.precioS}</TableCell>
                                            <TableCell align='right'>{k.totalCantidad}</TableCell>
                                            <TableCell align='right'>{k.totalValor}</TableCell>
                                            <TableCell align='right'>{k.precioUnitario}</TableCell> */}
                                            <TableCell className={classes.tableCellBody}>{k.registerDate}</TableCell>
                                            <TableCell align='center' className={classes.tableCellBody}>{k.notaRemision}</TableCell>
                                            <TableCell className={classes.tableCellBody}>{k.procedenciaDestino}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.cantidadE}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.precioE}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.cantidadS}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.precioS}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.cantidadTotal}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.precioTotal}</TableCell>
                                            <TableCell align='right' className={classes.tableCellBody}>{k.precioUnitario}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell align='center' colSpan='11' style={{ display: progress }}>
                                            <CircularProgress />
                                            {/* <LinearProgress /> */}
                                        </TableCell>
                                        <TableCell style={{ display: exist }} colSpan='11' align='center'>no existen datos</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
            {/* -------------------------MODAL REGISTER SALIDAS------------------------- */}
            <Dialog
                open={openModalSalida}
                onClose={closeModalSalidaMaterial}
                maxWidth='sm'
            >
                <Paper component={Box} p={2}>
                    <Typography variant='subtitle1' align='center'>Regitrar Salida de Materiales</Typography>
                    <form onSubmit={postSalidas}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name='numVale'
                                    label='Numero de Pedido de Vale'
                                    variant='outlined'
                                    fullWidth
                                    size='small'
                                    className={classes.spacingTextField}
                                    value={changeData.numVale}
                                    onChange={handleChage}
                                    required
                                />
                                <TextField
                                    name='procedenciaDestino'
                                    label='Procedencia o Destino'
                                    variant='outlined'
                                    fullWidth
                                    size='small'
                                    className={classes.spacingTextField}
                                    value={changeData.procedenciaDestino}
                                    onChange={handleChage}
                                    required
                                />
                                <TextField
                                    name='registerDate'
                                    label='Fecha de Salida'
                                    variant='outlined'
                                    fullWidth
                                    size='small'
                                    type='date'
                                    InputLabelProps={{ shrink: true }}
                                    className={classes.spacingTextField}
                                    value={changeData.registerDate}
                                    onChange={handleChage}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name='cantidadS'
                                    label='Cantidad'
                                    variant='outlined'
                                    inputProps={{ step: 'any' }}
                                    type='number'
                                    fullWidth
                                    size='small'
                                    className={classes.spacingTextField}
                                    value={changeData.cantidadS}
                                    onChange={handleChage}
                                    required
                                />
                                {/* <TextField
                                    name='precioUnitario'
                                    label='Precio Unitario'
                                    variant='outlined'
                                    fullWidth
                                    inputProps={{ step: 'any' }}
                                    type='number'
                                    size='small'
                                    className={classes.spacingTextField}
                                    value={changeData.precioUnitario}
                                    onChange={handleChage}
                                    required
                                /> */}
                                <TextField
                                    name='precioS'
                                    label='Precio Total'
                                    variant='outlined'
                                    fullWidth
                                    inputProps={{ step: 'any' }}
                                    type='number'
                                    size='small'
                                    className={classes.spacingTextField}
                                    value={changeData.precioS}
                                    onChange={handleChage}
                                    required
                                />
                            </Grid>
                        </Grid>
                        <Button
                            endIcon={<SaveIcon />}
                            variant='contained'
                            type='submit'
                            fullWidth
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)'
                            }}
                        >Registrar Salida</Button>
                    </form>
                </Paper>
            </Dialog>
            {/* -------------------------ALERTS------------------------ */}
            <SuccessAlertsSalidas open={openAlertSuccess} setOpen={openCloseAlertSuccess} />
            <ErrorAlertsSalidas open={openAlertError} setOpen={openCloseAlertError} />
        </>
    )
}

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
    },
    spacingTextField: {
        marginBottom: 10
    },
    tableCellBody: {
        // fontSize: 'small',
    }
}))
export default KardexValorado