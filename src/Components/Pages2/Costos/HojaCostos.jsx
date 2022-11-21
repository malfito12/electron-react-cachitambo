import { Box, makeStyles, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Grid, TextField, InputAdornment, Container, IconButton, Tooltip, TableFooter, CircularProgress } from '@material-ui/core'
import React, { useState } from 'react'
import { useEffect } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import sello from '../../../images/sello.png'
import SearchIcon from '@material-ui/icons/Search';
import PrintIcon from '@material-ui/icons/Print';

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
const HojaCostos = () => {
    const classes = useStyles()
    const [material, setMaterial] = useState([])
    const [saldoTotalMaterial, setSaldoTotalMaterial] = useState([])
    const [progress, setProgress] = useState('none')
    const [exist, setExist] = useState('none')
    useEffect(() => {
        getMateriales()
        getSaldoTotalMaterial()
    }, [])
    //----------------GET MATERIALES--------------------------------
    const getMateriales = async () => {
        try {
            const result = await ipcRenderer.invoke("get-material")
            setMaterial(JSON.parse(result))
        } catch (error) {
            console.log(error)
        }
    }
    //-------------------GET SALTO TOTAL MATERIAL-----------------------------
    const getSaldoTotalMaterial = async () => {
        setProgress('block')
        try {
            const result = await ipcRenderer.invoke("get-saldoTotalMaterial")
            .then(resp=>{
                if (JSON.parse(resp.length) === 0) {
                    setExist('block')
                }
                setProgress('none')
                setSaldoTotalMaterial(JSON.parse(resp))
                // setSaldoTotalMaterial(JSON.parse(result))
            })
        } catch (error) {
            console.log(error)
        }
    }
    //----------------------------------------------------------
    var sumTotal=0;
    if(saldoTotalMaterial.length>0){
        for(var i=0;i<saldoTotalMaterial.length;i++){
            // console.log(parseFloat(saldoTotalMaterial[i].saldoTotal))
            var num=parseFloat(saldoTotalMaterial[i].otroSaldo)
            sumTotal=sumTotal+num
        }
    }
    //----------------------------------------------------------
    const contador = material.length
    var array = []
    var dos;
    for (var i = 0; i < contador; i++) {
        dos = { ...material[i], ...saldoTotalMaterial[i] }
        array.push(dos)
    }
    //---------------------------BUSCADOR---------------------------------------------
    const [buscador, setBuscador] = useState("")

    const buscarHojaCosto = (buscador) => {
        return function (x) {
            return x.codMaterial.includes(buscador) ||
                x.codMaterial.toLowerCase().includes(buscador) ||
                x.nameMaterial.includes(buscador) ||
                x.nameMaterial.toLowerCase().includes(buscador) ||
                x.saldoTotal.includes(buscador) ||
                x.saldoTotal.toLowerCase().includes(buscador) ||
                !buscador
        }

    }
    //--------------------PDF GENERATE----------------------------
    const pdfGenerate = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: [11, 7] })
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.height()
        doc.setFontSize(14)
        doc.setFont('Courier', 'Bold');
        doc.addImage(`${sello}`, 0.5, 0.3, 1.3, 0.5)
        doc.text("HOJA DE COSTOS ALMACEN INGENIO CACHITAMBO", pageWidth / 2, 1, 'center')
        doc.autoTable({
            headStyles: {
                fillColor: [50, 50, 50]
            },
            bodyStyles: {
                cellPadding: 0.01
            },
            footStyles: {
                fillColor: [50, 50, 50],
                cellPadding: 0.01
            },
            head: [[
                { content: 'N°' },
                { content: 'Codigo', styles: { halign: 'center' } },
                { content: 'Decripción de Material', styles: { halign: 'center' } },
                { content: 'Total Saldo Bs.', styles: { halign: 'center' } },
            ]],
            body: array.map((d, index) => ([
                { content: index + 1 },
                { content: d.codMaterial ? d.codMaterial : "", styles: { halign: 'center' } },
                { content: d.nameMaterial ? d.nameMaterial : "" },
                { content: d.saldoTotal ? d.saldoTotal : "", styles: { halign: 'right' } },
            ])),
            styles: { fontSize: 8, font: 'courier', fontStyle: 'bold' },
            startY: 1.3,
        })
        doc.autoTable({
            body: [
                [
                    { content: 'Total', colSpan: 3 },
                    { content: sumTotal.toFixed(2), styles: { halign: 'right' } }
                ]
            ],
            styles: { fontSize: 8, font: 'courier', fontStyle: 'bold' },
            startY: doc.lastAutoTable.finalY+0.1,
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
    //----------------------------------------------------------
    //----------------------------------------------------------
    // console.log(material)
    // console.log(array)
    // console.log(saldoTotalMaterial)
    // var ss=123345666.677
    // console.log(new Intl.NumberFormat('es-MX').format(ss))
    return (
        <>
            <Typography style={{ paddingTop: '3rem', marginBottom: '1rem',color:'white' }} variant='h6' align='center'>HOJA DE COSTOS ALMACEN CACHITAMBO</Typography>
            <Container maxWidth='lg'>
                <Grid container direction='row' justifyContent='flex-end' alignItems='center' style={{ marginBottom: '0.5rem' }}>
                    <div>
                        {material &&
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
                    </div>
                </Grid>
                {/* ------------------------------------------------------------------*/}
                <Paper component={Box} p={0.3}>
                    <TableContainer style={{ maxHeight: 450 }}>
                        <Table id='id-table' stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>N°</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Codigo</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Material</TableCell>
                                    <TableCell style={{ color: 'white', backgroundColor: "black" }}>Total Saldo Bs</TableCell>
                                    {/* <TableCell style={{ color: 'white', backgroundColor: "black" }}>Total Saldo $us</TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {array.length > 0 ? (
                                    array.filter(buscarHojaCosto(buscador)).map((m, index) => (
                                        <TableRow key={m._id} className={classes.tableRow}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{m.codMaterial}</TableCell>
                                            <TableCell>{m.nameMaterial}</TableCell>
                                            <TableCell align='right'>{m.saldoTotal}</TableCell>
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
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} style={{color:'black'}}>Total</TableCell>
                                    {/* <TableCell align='right'>{sumTotal}</TableCell> */}
                                    <TableCell style={{color:'black'}} align='right'>{new Intl.NumberFormat('es-BO').format(sumTotal)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </>
    )
}

export default HojaCostos
