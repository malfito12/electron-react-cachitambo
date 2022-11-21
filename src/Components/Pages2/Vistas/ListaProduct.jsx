import { Container, Box, makeStyles, Paper, Dialog, Typography, TableContainer, Table, TableRow, TableCell, TableBody, TableHead, IconButton, Grid, InputAdornment, TextField, Button, Tooltip, CircularProgress, LinearProgress } from '@material-ui/core'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import RegisterMaterial from '../Registros/RegisterMaterial'
import TableChartIcon from '@material-ui/icons/TableChart';
import SearchIcon from '@material-ui/icons/Search';
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import PrintIcon from '@material-ui/icons/Print';
import sello from '../../../images/sello.png'
import { useHistory } from 'react-router-dom'
import { ErrorAlertsMateriales, SuccessAlertsMateriales } from '../../Atoms/Alerts/Alerts'

const ipcRenderer = window.require('electron').ipcRenderer
const useStyles = makeStyles((theme) => ({
    spacingBot: {
        marginBottom: '1rem'
    },
    tableRow: {
        "&:hover": {
            backgroundColor: "#bbdefb"
        }
    }
}))
const ListaProduct = (props) => {
    // console.log(props)
    const classes = useStyles()
    // const { history } = props
    const history=useHistory()
    // console.log(history)
    const [material, setMaterial] = useState([])
    const [buscador, setBuscador] = useState("")
    const [openEditMaterial, setOpenEditMaterial] = useState(false)
    const [openDeleteMaterial, setOpenDeleteMaterial] = useState(false)
    const [openAlertSuccess, setOpenAlertSuccess] = useState(false)
    const [openAlertError, setOpenAlertError] = useState(false)
    const [progress, setProgress] = useState('none')
    const [exist, setExist] = useState('none')
    const [changeData, setChangeData] = useState({
        _id: '',
        codMaterial: '',
        nameMaterial: '',
    })

    useEffect(() => {
        getMateriales()
    }, [])

    //-------------GET MATERIALES-----------------------------
    const getMateriales = async () => {
        setProgress('block')
        try {
            const result = await ipcRenderer.invoke('get-material')
                .then(resp => {
                    if (JSON.parse(resp.length) === 0) {
                        setExist('block')
                    }
                    setProgress('none')
                    setMaterial(JSON.parse(resp))
                    // setMaterial(JSON.parse(result))
                })
        } catch (error) {
            console.log(error)
        }
    }
    //-------------EDIT MATERIAL-----------------------------
    const openModalEditMaterial = (e) => {
        setChangeData(e)
        setOpenEditMaterial(true)
    }
    const closeModalEditMaterial = () => {
        setOpenEditMaterial(false)
    }
    const editMaterial = async (e) => {
        e.preventDefault()
        // const id=changeData._id
        const result = await ipcRenderer.invoke("edit-material", changeData)
            .then(resp => {
                getMateriales()
                closeModalEditMaterial()
                openCloseAlertSuccess()
            })
            .catch(err => {
                openCloseAlertError()
            })
        // console.log(JSON.parse(result))
    }
    //-------------DELETE MATERIAL-----------------------------
    const openModalDeleteMaterial = (e) => {
        setChangeData(e)
        setOpenDeleteMaterial(true)
    }
    const closeModalDeleteMaterial = () => {
        setOpenDeleteMaterial(false)
    }
    const deleteMateerial = async (e) => {
        e.preventDefault()
        // const id=changeData._id
        const result = await ipcRenderer.invoke("delete-material", changeData)
            .then(resp => {
                getMateriales()
                closeModalDeleteMaterial()
                openCloseAlertSuccess()
            })
            .catch(err => {
                openCloseAlertError()
            })
        // console.log(JSON.parse(result))
    }
    //-------------COLOR DE TABLAS-----------------------------
    const getTableColor = (e) => {
        // console.log(e)
        if (e % 2 !== 0) {
            return { backgroundColor: '#e1f5fe' }
        }
    }
    //--------------------HANDLE CHANGE--------------------------
    const handleChange = (e) => {
        setChangeData({
            ...changeData,
            [e.target.name]: e.target.value
        })
    }
    //--------------------IR A SUB-MATERIALES--------------------------
    const irSubMateriales = (e) => {
        const code = e.codMaterial
        const nameMaterial = e.nameMaterial
        history.push({
            pathname:'/listaSubmateriales/' + code + '/' + nameMaterial,
            data:{code:code,nameMaterial:nameMaterial},
            search: '?update=true',
            state: {update: true}
        })
        // history.push('/listaSubmateriales')
    }
    //-----------------------BUSCADOR---------------------------
    const buscarMaterial = (buscador) => {
        return function (x) {
            return x.codMaterial.includes(buscador) ||
                x.nameMaterial.toLowerCase().includes(buscador) ||
                x.nameMaterial.includes(buscador) ||
                !buscador

        }
    }
    //--------------------IMPRIMIR-----------------------------
    const pdfGenerate = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [11, 7] })

        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()

        document.getElementById('desaparecer1').style.display = 'none'
        document.getElementById('desaparecer2').style.display = 'none'
        // doc.setFont('Helvetica');
        doc.setFontSize(15)
        doc.setFont('Courier', 'Bold');
        doc.addImage(`${sello}`, 0.5, 0.3, 1.5, 0.7)
        doc.text(`Tabla de Materiales`, pageWidth / 2, 1, 'center');
        // doc.autoTable({ html: "#id-table",startY:1.3, styles: { halign: 'center' }, margin: { top: 2 } })
        // doc.autoTable({ html: "#id-table",startY:1.3,styles: { halign: 'center',fontSize:8 }})
        doc.autoTable({
            headStyles: {
                fillColor: [50, 50, 50]
            },
            bodyStyles: {
                cellPadding: 0.01
            },
            // alternateRowStyles: { fillColor: [231, 215, 252] },
            // tableLineColor: [124, 95, 240],
            // tableLineWidth: 0.01,
            head: [[
                { content: 'N°' },
                { content: 'Codigo', styles: { cellWidth: 1 } },
                { content: 'Material', styles: { halign: 'center' } }
            ]],
            body: material.map((d, index) => ([
                { content: index + 1 },
                { content: d.codMaterial },
                { content: d.nameMaterial }
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
        document.getElementById('desaparecer1').style.display = 'revert'
        document.getElementById('desaparecer2').style.display = 'revert'
        window.open(doc.output('bloburi'))
        // doc.save('ListaMateriales.pdf')
    }
    // console.log(material)
    // console.log(changeData)
    //-----------------------------------------------
    // const [nuevo, setNuevo] = useState("relative")
    // const [mio, setMio] = useState("5rem")
    // const changeScroll = (e) => {
    //     e.preventDefault()
    //     if (window.scrollY >= 100) {
    //         setNuevo("fixed")
    //         setMio("0")
    //     } else {
    //         setNuevo("relative")
    //         setMio("5rem")
    //     }
    //     // console.log(window.scrollY)
    // }
    // window.addEventListener('scroll', changeScroll)
    //--------------------------------------------
    //----------------------------------------------------
    const openCloseAlertSuccess = () => {
        setOpenAlertSuccess(!openAlertSuccess)
    }
    const openCloseAlertError = () => {
        setOpenAlertError(!openAlertError)
    }

    return (
        <>
            <Typography style={{ paddingTop: '2rem', marginBottom: '1rem', color: 'white' }} variant='h5' align='center' >Lista de Productos</Typography>
            <Container maxWidth={false}>
                <Grid container direction='row' justifyContent='space-between' alignItems='center' style={{ marginBottom: '0.5rem' }}>
                    <RegisterMaterial uno={getMateriales} />
                    <div>
                        {material &&
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
                    </div>
                </Grid>
                <Paper component={Box} p={0.3}>
                    <TableContainer style={{ maxHeight: 450 }}>
                        <Table id='id-table' stickyHeader size='small' >
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>N°</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Codigo</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Material</TableCell>
                                    <TableCell id='desaparecer1' style={{ color: 'white', backgroundColor: "black" }} align='center'>Sub-Materiales</TableCell>
                                    <TableCell id='desaparecer2' style={{ color: 'white', backgroundColor: "black" }} align='center'>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {material.length > 0 ? (
                                    material.filter(buscarMaterial(buscador)).map((m, index) => (
                                        <TableRow key={m._id} /*style={getTableColor(index)}*/ className={classes.tableRow}>
                                            <TableCell /*style={{ fontSize: '10px' }}*/>{index + 1}</TableCell>
                                            <TableCell>{m.codMaterial}</TableCell>
                                            <TableCell>{m.nameMaterial}</TableCell>
                                            <TableCell align='center' style={{ padding: 0, margin: 0 }}>
                                                <Tooltip title='sub-materiales'>
                                                    <IconButton size='small' onClick={() => irSubMateriales(m)}>
                                                        <TableChartIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell style={{ padding: 0, margin: 0 }}>
                                                <Grid container justifyContent='space-evenly'>
                                                    <Tooltip title='edit'>
                                                        <IconButton size='small' style={{ color: 'green' }} onClick={() => openModalEditMaterial(m)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='delete'>
                                                        <IconButton size='small' style={{ color: 'red' }} onClick={() => openModalDeleteMaterial(m)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell align='center'colSpan='5' style={{ display: progress }}>
                                            <CircularProgress />
                                            {/* <LinearProgress /> */}
                                        </TableCell>
                                        <TableCell style={{ display: exist }} colSpan='5' align='center'>no existen datos</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
            <Dialog
                open={openEditMaterial}
                onClose={closeModalEditMaterial}
                maxWidth='sm'
            >
                <Paper component={Box} p={2}>
                    <Typography align='center' variant='subtitle1'>EDITAR MATERIAL</Typography>
                    <form onSubmit={editMaterial}>
                        <TextField
                            disabled
                            name='codMaterial'
                            label='Codigo de Material'
                            variant='outlined'
                            size='small'
                            fullWidth
                            value={changeData.codMaterial}
                            className={classes.spacingBot}
                            // onChange={handleChange}
                            required
                        />
                        <TextField
                            name='nameMaterial'
                            label='Codigo de Material'
                            variant='outlined'
                            size='small'
                            fullWidth
                            defaultValue={changeData.nameMaterial}
                            className={classes.spacingBot}
                            onChange={handleChange}
                            required
                        />
                        <Grid container justifyContent='space-evenly'>
                            <Button style={{ fontSize: 'xx-small' }} variant='contained' color='primary' type='submit'>aceptar</Button>
                            <Button style={{ fontSize: 'xx-small' }} variant='contained' color='secondary' onClick={closeModalEditMaterial}>cancelar</Button>
                        </Grid>
                    </form>
                </Paper>
            </Dialog>
            <Dialog
                open={openDeleteMaterial}
                onClose={closeModalDeleteMaterial}
                maxWidth='xs'
            >
                <Paper component={Box} p={2}>
                    <Typography className={classes.spacingBot} align='center' variant='subtitle1'>¿Estas seguro de eliminar " {changeData.nameMaterial} " y todos sus registros?</Typography>
                    <Grid container justifyContent='space-evenly'>
                        <Button style={{ fontSize: 'xx-small' }} variant='contained' color='primary' onClick={deleteMateerial}>aceptar</Button>
                        <Button style={{ fontSize: 'xx-small' }} variant='contained' color='secondary' onClick={closeModalDeleteMaterial}>cancelar</Button>
                    </Grid>
                </Paper>
            </Dialog>
            {/* -------------------------ALERTS------------------------ */}
            <SuccessAlertsMateriales open={openAlertSuccess} setOpen={openCloseAlertSuccess} />
            <ErrorAlertsMateriales open={openAlertError} setOpen={openCloseAlertError} />
        </>
    )
}

export default ListaProduct
