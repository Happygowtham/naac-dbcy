import { Box, Button, Card, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "src/AxiosInstance";
import MetricsEdit from "./Metrics";
import Evidences from "./Evidences";
import { groupBy } from "src/Functions/Functions";
import MultiYearData from "./MultiYearData";
import html2pdf from 'html2pdf.js';

const BenchmarkScore = () => {

    const [metricData, setMetricData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yearOptions, setYearOptions] = useState([]);
    const [year, setYear] = useState({ year: "" });
    const [editMetricData, setEditMetricData] = useState({ show: false, item: {} });
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance(`/year`, { method: "GET" })
            .then(res => {
                let value = []
                res?.data?.forEach(item => value.push({ id: item?.id, name: item?.from_year + " - " + item?.to_year }))
                setYearOptions(value);
                let activeYear = res?.data?.filter(yer => yer?.is_active_year === true)
                setYear({ year: activeYear?.[0]?.id })
                getData(activeYear?.[0]?.id)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year?.length === 0])

    const getData = (year1) => {
        axiosInstance(`/metrics/?criteria=&year=${year1 || year?.year}`, { method: "GET" })
            .then(res => {
                let dat = res?.data;
                let eviData = groupBy(dat, "key_identifier");
                setMetricData(eviData);
                setLoading(false);
            }).catch(err => {
                setLoading(false)
            })
    }

    const handleYearChange = (event) => {
        setYear({ [event.target.name]: event.target.value })
        getData(event.target.value)
    }

    const handleEditClick = (item) => {
        setEditMetricData({ show: true, item: item })
    }

    const printtoPdf = () => {
        const element = document.getElementById("page-content");
        const options = {
            margin: [20, 20, 20, 20],
            filename: `Criterio ${Object.values(metricData)?.[0]?.[0]?.criteria?.number} - ${Object.values(metricData)?.[0]?.[0]?.criteria?.name}`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        }

        html2pdf().from(element).set(options).save();
    }


    return (
        <>

            <Box sx={{ display: "flex", justifyContent: "space-between", m: 1 }}>
                <Typography variant="h5">Criterio {Object.values(metricData)?.[0]?.[0]?.criteria?.number} - {Object.values(metricData)?.[0]?.[0]?.criteria?.name}</Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip title="Click here to print PDF">
                        <Button variant="contained" sx={{ mr: 2 }} onClick={printtoPdf}>PDF</Button>
                    </Tooltip>
                    <FormControl fullWidth sx={{ mr: 2 }}>
                        <InputLabel id="demo-simple-select-label" size="small">Select Year</InputLabel>
                        <Select
                            size="small"
                            name="year"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select Year"
                            value={year?.year}
                            onChange={handleYearChange}
                        >
                            {yearOptions?.map(res => {
                                return (
                                    <MenuItem value={res?.id}>{res?.name}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <Button sx={{ mr: 2 }} size="small" variant="contained" color="error" onClick={() => navigate("/dashboard")}>Back</Button>
                </Box>
            </Box>
            <Box id="page-content">
                {
                    Object.values(metricData)?.length > 0 && Object.values(metricData)?.map((res, id) => {
                        return (
                            <>
                                <Typography variant="h6" sx={{ pl: 1 }}>{res?.[0]?.key_identifiers?.number} - {res?.[0]?.key_identifiers?.name}</Typography>
                                <table border={1} style={{ borderCollapse: "collapse", marginLeft: "10px", marginTop: "10px" }}>
                                    <thead>
                                        <th style={{ padding: "10px" }}>Metric</th>
                                        <th style={{ padding: "10px" }}>Description</th>
                                        <th style={{ padding: "10px" }}>Benchmark Score</th>
                                    </thead>
                                    {
                                        res?.map(item => {
                                            return (
                                                <tr>
                                                    <td style={{ padding: "5px", textAlign: "center" }}>{item?.number}</td>
                                                    <td style={{ padding: "5px" }}>{item?.question}</td>
                                                    <td style={{ padding: "5px", textAlign: "center" }}>{item?.bench_mark_value}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </table>
                            </>
                        )
                    })
                }
            </Box >
        </>
    )
}

export default BenchmarkScore;