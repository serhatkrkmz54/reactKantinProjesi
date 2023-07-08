import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LayoutContext } from '../layout/context/layoutcontext';
import axios from 'axios';
import { classNames } from 'primereact/utils';


const lineData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    datasets: [
        {
            label: 'Satış Skalası(Yıllık)',
            data: [28, 48, 40, 19, 86, 27, 90, 100, 200, 60, 40, 29],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
};

const Dashboard = () => {
    const [veri, setVeri] = useState("");
    const menu1 = useRef(null);
    const menu2 = useRef(null);
    const [lineOptions, setLineOptions] = useState(null);
    const { layoutConfig } = useContext(LayoutContext);

    useEffect(() => {
        axios.get("http://localhost:8000/api/product/")
        .then((res) => {
          setVeri(res.data.data)
          const reversedData = res.data.data.reverse();
          setVeri(reversedData);
         console.log(res.data)
        });
      }, []);
      
      const stockBodyTemplate = (rowData) => {
        const stockClassName = classNames('border-circle w-2rem h-2rem inline-flex font-bold justify-content-center align-items-center text-sm', {
            'bg-red-100 text-red-900': rowData.stock_quantity === 0,
            'bg-blue-100 text-blue-900': rowData.stock_quantity > 0 && rowData.stock_quantity <= 10,
            'bg-teal-100 text-teal-900': rowData.stock_quantity > 10
        });

        return <div className={stockClassName}>{rowData.stock_quantity}</div>;
    };

    const applyLightTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };

        setLineOptions(lineOptions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);


    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Aylık Satılan Ürün</span>
                            <div className="text-900 font-medium text-xl">4805</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-shopping-cart text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">+2.5%</span>
                    <span className="text-500"> bir önceki aya göre oran</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Toplam Kar(Aylık)</span>
                            <div className="text-900 font-medium text-xl">₺2.100</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-shopping-bag text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">%52+ </span>
                    <span className="text-500">bir önceki aya oran</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Toplam Kar(Yıllık)</span>
                            <div className="text-900 font-medium text-xl">₺28441</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-inbox text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">%52+ </span>
                    <span className="text-500">bir önceki yıla oran</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Satış Maliyeti(Aylık)</span>
                            <div className="text-900 font-medium text-xl">₺9000</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-money-bill text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">85 </span>
                    <span className="text-500">kar/zarar oran</span>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Son Girilen Ürünler</h5>
                    <DataTable value={veri} rows={5} paginator responsiveLayout="scroll">
                        <Column field="product_name" header="Ürün İsmi" sortable style={{ width: '50%' }} />
                        <Column field="stock_quantity" body={stockBodyTemplate} header="Toplam Ürün Stoğu" sortable style={{ width: '30%' }} />

                    </DataTable>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Satış İstatistikleri(Aylık)</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
