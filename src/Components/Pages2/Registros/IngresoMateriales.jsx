import { Container, Box, MenuItem, Grid, makeStyles, TextField, Typography, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, Button, Tooltip, IconButton, Dialog, TableFooter, InputAdornment } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import sello from '../../../images/sello.png'
import ArchiveIcon from '@material-ui/icons/Archive';
import SaveIcon from '@material-ui/icons/Save';
import PrintIcon from '@material-ui/icons/Print';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import { ErrorDuplicidad, ErrorPrintIngresoMat, ErrorRegisterIngresoMat, SuccessRegisterIngresoMat } from '../../Atoms/Alerts/Alerts'

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '0.5rem',
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
const IngresoMateriales = () => {
    const classes = useStyles()
    const [material, setMaterial] = useState([])
    const [deleteArrayData, setDeleteArrayData] = useState(false)
    const [subMaterial, setSubMaterial] = useState([])
    const [unidadM, setUnidadM] = useState([])
    const [numeroIngreso, setNumeroIngreso] = useState([])
    const [modalEditData, setModalEditData] = useState(false)
    const [openAlertPrintError, setOpenAlertPrintError] = useState(false)
    const [openAlertRegisterError, setOpenAlertRegisterError] = useState(false)
    const [openAlertRegisterSuccess, setOpenAlertRegisterSuccess] = useState(false)
    const [openAlertDuplicidad, setOpenAlertDuplicidad] = useState(false)
    const [changeData, setChageData] = useState({
        typeRegister: 'entrada',
        numFactura: '',
        nameMaterial: '',
        nameSubMaterial: '',
        cantidadF: '',
        cantidadR: '',
        deDonde: '',
        unidadMedida: '',
        precio: '',
        // precioUnitario: '',
        procedenciaDestino: '',
        registerDate: '',
        numeroIngreso: '',
        codMaterial: '',
        codSubMaterial: '',
    })

    useEffect(() => {
        getMaterial()
        // getNumeroIngreso()
    }, [])

    //------------GET MATERIAL-------------------------------
    const getMaterial = async () => {
        try {
            const result = await ipcRenderer.invoke('get-material')
                .then(resp => {
                    setMaterial(JSON.parse(resp))
                })
                .catch(err => console.log(err))
        } catch (error) {
            console.log(error)
        }
    }
    //-------------------POST ENTRADA DE MATERIALES--------------------------
    const postEntradas = async (e) => {
        e.preventDefault()
        if (uno.length > 0) {
            if (deleteArrayData === true) {
                openCloseAlertDuplicidad()
                setTimeout(() => { setOpenAlertDuplicidad(false) }, 4000)
                return
            } else {
                try {
                    const result = await ipcRenderer.invoke('post-entradas', uno)
                    console.log(JSON.parse(result))
                    openCloseAlertRegisterSuccess()
                    setTimeout(() => { setOpenAlertRegisterSuccess(false) }, 4000)
                    setDeleteArrayData(true)
                } catch (error) {
                    console.log(error)
                    openCloseAlertRegisterError()
                    setTimeout(() => { setOpenAlertRegisterError(false) }, 4000)
                }
            }
        } else {
            openCloseAlertRegisterError()
            setTimeout(() => { setOpenAlertRegisterError(false) }, 4000)
        }

    }
    //---------------------GET NUMERO DE INGRESO-------------------------
    // const getNumeroIngreso = async () => {
    //     try {
    //         const result = await ipcRenderer.invoke(`get-numeroIngreso`)
    //         setNumeroIngreso(JSON.parse(result))
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }
    //-----------------------GET MATERIAL ESPECIFICO------------------------
    const getSpecificMaterial = async () => {
        const data = changeData.codMaterial
        try {
            const result = await ipcRenderer.invoke('get-specific-material', data)
                .then(resp => {
                    const aux = JSON.parse(resp)
                    const lala = { target: { name: 'nameMaterial', value: aux[0].codMaterial + '#' + aux[0].nameMaterial } }
                    handleChange(lala)
                })
        } catch (error) {
            console.log(error)
        }
    }
    //----------------------GET SUB MATERIAL SPECIFICO--------------------------
    const getSpecificSubMaterial = async () => {
        const data = changeData.codSubMaterial
        try {
            const result = await ipcRenderer.invoke('get-specific-sub-material', data)
                .then(resp => {
                    // console.log(JSON.parse(resp))
                    const aux = JSON.parse(resp)
                    const lala = { target: { name: 'nameSubMaterial', value: aux[0].codSubMaterial + '#' + aux[0].nameSubMaterial } }
                    handleChange(lala)
                })
        } catch (error) {
            console.log(error)
        }
    }
    //----------------GET UNIDAD DE MEDIDA---------------------
    const getUnidad = async (e) => {
        try {
            const result = await ipcRenderer.invoke('get-um', e)
            setUnidadM(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }
    }
    //------------------GET SUB-MATERIALES--------------------------
    const getSubMaterial = async (e) => {
        try {
            const result = await ipcRenderer.invoke('get-submaterial', e)
            setSubMaterial(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }
        // console.log(e)
    }
    //-------------------TABLA AUXILIAR--------------------------
    const [uno, setUno] = useState([])
    const [sum, setSum] = useState(0)
    var dos;
    const introducir = (e) => {
        e.preventDefault()

        // console.log(changeData)
        // sum=sum+changeData.precio
        setSum(sum + parseFloat(changeData.precio))
        var aux = changeData.nameSubMaterial
        var aux2 = changeData.nameMaterial
        aux = aux.split("#")
        aux2 = aux2.split("#")
        var fecha = changeData.registerDate
        var change = fecha.split('-')
        var newFecha = change[2] + '-' + change[1] + '-' + change[0]
        const nuevo = { nameSubMaterial: aux[1], codSubMaterial: aux[0], nameMaterial: aux2[1], codMaterial: aux2[0] }
        const precioUnitario = parseFloat(changeData.precio) / parseFloat(changeData.cantidadF)
        var roundedNum = (Math.round(precioUnitario * 100) / 100).toFixed(2);
        // dos = { ...changeData, ...nuevo, id: uuidv4(), registerDate: newFecha,idAlmacen:uuidv4(),precioUnitario:roundedNum }
        dos = { ...changeData, ...nuevo, id: uuidv4(), registerDate: newFecha, idAlmacen: uuidv4() }
        // console.log(dos)

        setUno([...uno, dos])
        document.getElementById('cantidadF').value = ""
        document.getElementById('cantidadR').value = ""
        document.getElementById('precio').value = ""
        // document.getElementById('precioUnitario').value = ""
    }
    // console.log(uno)
    //---------------------DELETE DATA---------------------
    const deleteData = (e) => {
        // console.log(e)
        var newArray = uno.filter((item) => item.id !== e.id);
        setSum(sum - parseFloat(e.precio))
        setUno(newArray)
        // setSum(sum-)
        if (uno.length === 1) {
            setDeleteArrayData(false)
        }
    }
    //---------------------DELETE DATA---------------------
    const deleteArray = () => {
        setUno([])
        setDeleteArrayData(false)
        setSum(0)
    }
    //---------------------EDIT DATA---------------------
    const openModalEditData = (e) => {
        console.log(e)
        setChageData(e)
        setModalEditData(true)
    }
    const closeModalEditData = () => {
        setModalEditData(false)
    }
    const editData = (e) => {
        e.preventDefault()
        const indice = uno.findIndex((elemento, indice) => {
            if (elemento.id === changeData.id) {
                return true;
            }
        })
        uno[indice] = changeData;
        closeModalEditData()
        // setUno(newArray)
    }
    //-------------------HANDLECHANGE EDIT--------------------------
    const handleChangeEdit = (e) => {
        setChageData({
            ...changeData,
            [e.target.name]: e.target.value
        })
    }
    //-------------------HANDLECHANGE--------------------------
    const handleChange = (e) => {
        // console.log(e)
        if (e.target.name === 'nameMaterial') {
            var aux = e.target.value
            aux = aux.split("#")
            getSubMaterial(aux[0])
        }
        if (e.target.name === 'nameSubMaterial') {
            var aux = e.target.value
            aux = aux.split("#")
            getUnidad(aux[0])
        }
        setChageData({
            ...changeData,
            unidadMedida: unidadM.length > 0 ? unidadM[0].unidadMedida : '',
            [e.target.name]: e.target.value
        })
    }
    // console.log(numeroIngreso)
    //----------------------PDF GENERATE------------------------
    // var aux;
    // var aux2 = 0;
    // var numIn;
    // var quebrado = new Date()
    // quebrado = quebrado.toString()
    // quebrado = quebrado.split("")
    // try {
    //     aux = numeroIngreso[0].numeroIngreso
    //     aux = aux.split("-")
    //     aux = parseInt(aux[1])
    //     aux = aux + 1
    //     aux = aux.toString()
    //     numIn = "IAC-" + aux + " /" + quebrado[13] + quebrado[14]
    //     // numIn = aux
    // } catch (error) {
    //     aux2++;
    //     aux2 = aux2.toString()
    //     numIn = "IAC-" + aux2 + " /" + quebrado[13] + quebrado[14]
    //     // numIn = aux2

    // }
    const pdfGenerate = async () => {
        if (uno.length > 0) {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [11, 7] })
            var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
            var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()
            doc.setFontSize(14)
            doc.setFont('Courier', 'Bold');
            doc.addImage(`${sello}`, 0.5, 0.3, 1.3, 0.5)
            doc.text(`INGRESO DE MATERIALES A ALMACEN`, pageWidth / 2, 1, 'center')
            doc.setFontSize(8)
            // // doc.text(`N°:  ${uno[0].numNIT}`, 140, 30)
            // doc.text(`N°: ${numIn}`, 5, 0.7)
            doc.text(`N°: ${uno[0].numeroIngreso}`, 5, 0.7)
            doc.text(`Potosi : ${uno[0].registerDate}`, 2, 1.2)
            doc.text(`Factura : ${uno[0].numFactura}`, 0.6, 1.35)
            doc.text(`Pedido N° : `, 0.6, 1.5)
            doc.text(`Carro F.C. N° : `, 0.6, 1.65)
            doc.text(`Peso : `, 0.6, 1.8)
            doc.text(`Recibido : `, 0.6, 1.95)
            doc.text(`De :  ${uno[0].deDonde}`, 2.6, 1.35)
            doc.text(`Fecha del Pedido : `, 2.6, 1.5)
            doc.text(`Carta Parte N° : `, 2.6, 1.65)
            doc.text(`Transportado en :`, 2.6, 1.8)
            doc.text(`Liquidacion N° :`, 2.6, 1.95)
            doc.text(`Seccion : `, 4.6, 1.5)
            doc.text(`Cantidad de Bultos : `, 4.6, 1.65)
            doc.text(`Fecha hoja de costo : `, 4.6, 1.8)
            doc.autoTable({
                headStyles: {
                    fillColor: [50, 50, 50],
                    cellPadding: 0.01
                },
                footStyles: {
                    fillColor: [50, 50, 50],
                    cellPadding: 0.01
                },
                bodyStyles: {
                    cellPadding: 0.01
                },
                head: [
                    [
                        { content: 'Item de Pedido', rowSpan: 2, styles: { halign: 'center', valign: 'middle', cellWidth: 0.5 } },
                        { content: 'Cantidad', colSpan: 2, styles: { halign: 'center', cellWidth: 1 } },
                        { content: 'Unidad', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                        { content: 'Descipción', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                        { content: 'Registro de Existencia', colSpan: 2, styles: { halign: 'center' } },
                    ],
                    [
                        { content: 'Facturada', styles: { halign: 'center' } },
                        { content: 'Recibida', styles: { halign: 'center' } },
                        { content: 'Kardex', styles: { halign: 'center' } },
                        { content: 'Monto Bs.', styles: { halign: 'center' } },
                    ]
                ],
                body: uno.map((d, index) => ([
                    { content: index + 1, styles: { halign: 'right' } },
                    { content: d.cantidadF ? d.cantidadF : "", styles: { halign: 'right' } },
                    { content: d.cantidadR ? d.cantidadR : "", styles: { halign: 'right' } },
                    { content: d.unidadMedida ? d.unidadMedida : "", styles: { halign: 'center' } },
                    { content: d.nameSubMaterial ? d.nameSubMaterial : "", styles: { halign: 'center' } },
                    { content: d.codSubMaterial ? d.codSubMaterial : "", styles: { halign: 'center' } },
                    { content: d.precio ? d.precio : "", styles: { halign: 'right' } },
                ])),
                foot: [
                    [
                        { content: 'Total', colSpan: 6 },
                        { content: sum.toFixed(2), styles: { halign: 'right' } }
                    ]
                ],
                styles: { fontSize: 8, font: 'courier', fontStyle: 'bold' },
                startY: 2.2,
            })

            doc.text(`Enc. Recepciones`, pageWidth / 6, doc.lastAutoTable.finalY + 0.95, 'left')
            doc.text(`Vo. Bo. Superintendente`, pageWidth / 2, doc.lastAutoTable.finalY + 1, 'center')
            doc.text(`Jefe de Almacen`, pageWidth / 1.2, doc.lastAutoTable.finalY + 0.95, 'right')
            var pages = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pages; i++) {
                var horizontalPos = pageWidth / 2
                var verticalPos = pageHeight - 0.2
                doc.setFontSize(8)
                doc.setPage(i)
                doc.text(`${i} de ${pages}`, horizontalPos, verticalPos, { align: 'center' })
            }
            window.open(doc.output('bloburi'))
        } else {
            openCloseAlertPrintError()
            setTimeout(() => { setOpenAlertPrintError(false); }, 4000)
            // console.log('no se ecuentran datos para imprimir, llena antes la tabla !!!!!!')
        }
    }
    // ------------------ALERTS---------------------------
    const openCloseAlertPrintError = () => {
        setOpenAlertPrintError(!openAlertPrintError)
    }
    const openCloseAlertRegisterError = () => {
        setOpenAlertRegisterError(!openAlertRegisterError)
    }
    const openCloseAlertRegisterSuccess = () => {
        setOpenAlertRegisterSuccess(!openAlertRegisterSuccess)
    }
    const openCloseAlertDuplicidad = () => {
        setOpenAlertDuplicidad(!openAlertDuplicidad)
    }

    // console.log(uno)
    // console.log(changeData)
    // console.log(subMaterial)
    return (
        <>
            {/* ------------------------------------------------------------------*/}
            <Typography className={classes.spacingBot} style={{ paddingTop: '2rem', marginBottom: '1rem', color: 'white' }} variant='h6' align='center'>INGRESO DE MATERIALES</Typography>
            <Container maxWidth='md'>
                <form id='registerForm' onSubmit={introducir}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name='numeroIngreso'
                                label='N° de Ingreso'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                onChange={handleChange}
                                value={changeData.numeroIngreso}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                name='numFactura'
                                label='N° de Factura'
                                variant='outlined'
                                className={classes.spacingBot}
                                fullWidth
                                size='small'
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                name='codMaterial'
                                label='Codigo de Material'
                                variant='outlined'
                                fullWidth
                                size='small'
                                // value={changeData.codMaterial}
                                className={classes.spacingBot}
                                style={{ background: 'white', borderRadius: 5 }}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size='small' onClick={getSpecificMaterial} component='span' style={{ color: 'white', background: '#2979ff' }}>
                                            <SearchIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <TextField
                                name='nameMaterial'
                                label='Material'
                                variant='outlined'
                                size='small'
                                select
                                fullWidth
                                className={classes.spacingBot}
                                value={changeData.nameMaterial}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            >
                                {material && material.map((m, index) => (
                                    <MenuItem key={m._id} value={`${m.codMaterial}#${m.nameMaterial}`} >{m.nameMaterial}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                name='codSubMaterial'
                                label='Codigo Sub Material'
                                variant='outlined'
                                fullWidth
                                size='small'
                                className={classes.spacingBot}
                                style={{ background: 'white', borderRadius: 5 }}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton size='small' onClick={getSpecificSubMaterial} component='span' style={{ color: 'white', background: '#2979ff' }}>
                                            <SearchIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <TextField
                                name='nameSubMaterial'
                                label='Nombre Sub-Material'
                                variant='outlined'
                                fullWidth
                                size='small'
                                select
                                className={classes.spacingBot}
                                value={changeData.nameSubMaterial}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            >
                                {subMaterial && subMaterial.map((m, index) => (
                                    <MenuItem key={m._id} value={`${m.codSubMaterial}#${m.nameSubMaterial}`}>{m.nameSubMaterial}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                id='cantidadF'
                                name='cantidadF'
                                label='Cantidad Facturada'
                                variant='outlined'
                                fullWidth
                                type='number'
                                size='small'
                                className={classes.spacingBot}
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                id='cantidadR'
                                name='cantidadR'
                                label='Cantidad Recibida'
                                variant='outlined'
                                fullWidth
                                type='number'
                                size='small'
                                className={classes.spacingBot}
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name='deDonde'
                                label='De'
                                variant='outlined'
                                fullWidth
                                size='small'
                                className={classes.spacingBot}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                name='unidadMedida'
                                label='Unidad de Medida'
                                variant='outlined'
                                fullWidth
                                size='small'
                                value={unidadM.length > 0 ? unidadM[0].unidadMedida : ''}
                                className={classes.spacingBot}
                                // onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            {/* <TextField
                                id='precioUnitario'
                                name='precioUnitario'
                                label='Precio Unitario Bs.'
                                variant='outlined'
                                fullWidth
                                type='number'
                                size='small'
                                className={classes.spacingBot}
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            /> */}
                            <TextField
                                id='precio'
                                name='precio'
                                label='Valor o Precio Bs.'
                                variant='outlined'
                                fullWidth
                                type='number'
                                size='small'
                                className={classes.spacingBot}
                                inputProps={{ step: 'any' }}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                name='procedenciaDestino'
                                label='Procedencia o Destino'
                                variant='outlined'
                                fullWidth
                                size='small'
                                className={classes.spacingBot}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                            <TextField
                                name='registerDate'
                                label='fecha de Ingreso'
                                variant='outlined'
                                fullWidth
                                type='date'
                                size='small'
                                InputLabelProps={{ shrink: true }}
                                className={classes.spacingBot}
                                onChange={handleChange}
                                style={{ background: 'white', borderRadius: 5 }}
                                required
                            />
                        </Grid>
                    </Grid>
                    <div align='center' style={{ marginTop: '0.5rem' }} >
                        <Button
                            size='small'
                            endIcon={<ArchiveIcon />}
                            variant='contained'
                            type='submit'
                            style={{
                                color: 'white',
                                background: 'linear-gradient(45deg, #0277bd 30%, #0097a7 90%)',
                            }} >insertar</Button>
                    </div>
                </form>
                {/* ---------------------ALERTS---------------------------- */}
                <div style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                    <ErrorPrintIngresoMat open={openAlertPrintError} setOpen={openCloseAlertPrintError} />
                    <ErrorRegisterIngresoMat open={openAlertRegisterError} setOpen={openCloseAlertRegisterError} />
                    <SuccessRegisterIngresoMat open={openAlertRegisterSuccess} setOpen={openCloseAlertRegisterSuccess} />
                    <ErrorDuplicidad open={openAlertDuplicidad} setOpen={openCloseAlertDuplicidad} />
                </div>
                {/* ---------------------------------------------------- */}
                <Paper component={Box} p={0.3}>
                    <TableContainer style={{ maxHeight: 200 }} >
                        <Table border='1' id='id-table' size='small'>
                            <TableHead >
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center' style={{ width: '10%' }}>Item del Pedido</TableCell>
                                    <TableCell className={classes.styleTablehead} colSpan='2' align='center' style={{ width: '20%' }}>Cantidad</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center' style={{ width: '15%' }}>Unidad</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center' style={{ width: '25%' }}>Descripcion</TableCell>
                                    <TableCell className={classes.styleTablehead} colSpan='2' align='center' style={{ width: '20%' }}>Registro de Existencia</TableCell>
                                    <TableCell className={classes.styleTablehead} rowSpan='2' align='center' style={{ width: '10%' }}>Acciones</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className={classes.styleTablehead} align='center'>Facturada</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Recibida</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>kardex</TableCell>
                                    <TableCell className={classes.styleTablehead} align='center'>Bs</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {uno.length > 0 ? (
                                    uno.map((u, index) => (
                                        <TableRow key={index} className={classes.tableRow}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell align='right'>{u.cantidadF}</TableCell>
                                            <TableCell align='right'>{u.cantidadR}</TableCell>
                                            <TableCell>{u.unidadMedida}</TableCell>
                                            <TableCell>{u.nameSubMaterial}</TableCell>
                                            <TableCell>{u.codSubMaterial}</TableCell>
                                            <TableCell align='right'>{u.precio}</TableCell>
                                            <TableCell>
                                                <Grid container justifyContent='space-evenly'>
                                                    <Tooltip title='edit'>
                                                        <IconButton style={{ width: 0, height: 0, color: 'green' }} onClick={() => openModalEditData(u)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='delete'>
                                                        {/* <IconButton style={{ width: 0, height: 0, color: 'red' }} onClick={() => deleteData(u.id)}> */}
                                                        <IconButton style={{ width: 0, height: 0, color: 'red' }} onClick={() => deleteData(u)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell align='center' colSpan='8'>no se encuentran datos</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                <Paper component={Box} m={0.1}>
                    <Grid container direction='row' justifyContent='space-between'>

                        <Typography style={{ padding: 5 }}>Total </Typography>
                        <Typography style={{ padding: 5, paddingRight: 20 }}> {sum.toFixed(2)}</Typography>
                    </Grid>
                </Paper>
                <div align='center' style={{ marginTop: '1rem' }} >
                    <Button
                        style={{
                            color: 'white',
                            background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)'
                        }}
                        variant='contained'
                        color='primary'
                        endIcon={<SaveIcon />}
                        onClick={postEntradas}
                        size='small'
                    >Registrar</Button>
                    <Button
                        style={{
                            color: 'white',
                            background: 'linear-gradient(45deg, #0277bd 30%, #0097a7 90%)',
                            marginLeft: '4rem'
                        }}
                        endIcon={<PrintIcon />}
                        variant='contained'
                        color='primary'
                        size='small'
                        onClick={pdfGenerate}
                    >imprimir</Button>
                    <Button
                        style={{
                            color: 'white',
                            background: 'linear-gradient(45deg, #d32f2f 30%, #ef5350 90%)',
                            marginLeft: '4rem'
                        }}
                        variant='contained'
                        color='primary'
                        endIcon={<DeleteIcon />}
                        onClick={deleteArray}
                        size='small'
                    >Eliminar</Button>
                </div>
            </Container>

            {/* ---------------------------MODAL EDIT DATA----------------------------- */}
            <Dialog
                open={modalEditData}
                onClose={closeModalEditData}
                maxWidth='md'
            >
                <Paper component={Box} p={2}>
                    <Typography variant='subtitle2' align='center' style={{ marginBottom: '1rem' }}>ACTUALIZAR</Typography>
                    <Grid container direction='column'>
                        <TextField
                            name='cantidadF'
                            variant='outlined'
                            size='small'
                            style={{ marginBottom: '1rem' }}
                            defaultValue={changeData.cantidadF}
                            inputProps={{ step: 'any' }}
                            type='number'
                            label='Cantidad Facturada'
                            onChange={handleChangeEdit}
                        />
                        <TextField
                            name='cantidadR'
                            variant='outlined'
                            size='small'
                            style={{ marginBottom: '1rem' }}
                            inputProps={{ step: 'any' }}
                            type='number'
                            defaultValue={changeData.cantidadR}
                            label='Cantidad Recibida'
                            onChange={handleChangeEdit}
                        />
                        <TextField
                            name='precio'
                            variant='outlined'
                            size='small'
                            style={{ marginBottom: '1rem' }}
                            defaultValue={changeData.precio}
                            inputProps={{ step: 'any' }}
                            type='number'
                            label='Precio'
                            onChange={handleChangeEdit}
                        />
                    </Grid>
                    <Grid container justifyContent='space-evenly'>
                        <Button variant='contained' color='primary' size='small' onClick={editData}>aceptar</Button>
                        <Button variant='contained' color='secondary' size='small' onClick={closeModalEditData}>cancelar</Button>
                    </Grid>
                </Paper>
            </Dialog>
        </>
    )
}

export default IngresoMateriales
