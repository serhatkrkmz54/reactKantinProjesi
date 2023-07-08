import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { OrganizationChart } from 'primereact/organizationchart';
import { Card } from 'primereact/card';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function kantinHeyetiSayfasi() {
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        // Simulate a delay
        setTimeout(() => setPageLoading(false), 300);
      }, []);

    const [data] = useState([
        {
            expanded: true,
            type: 'person',
            className: 'bg-indigo-500 text-white',
            style: { borderRadius: '12px' },
            data: {
                image: '/layout/images/default-profile.png',
                name: 'Sedat K....',
                title: 'Birlik Sorumlusu'
            },
            children: [
                {
                    expanded: true,
                    type: 'person',
                    className: 'bg-purple-500 text-white',
                    style: { borderRadius: '12px' },
                    data: {
                        image: '/layout/images/default-profile.png',
                        name: 'Sedat K...',
                        title: 'Kantin Başkanı'
                    },
                    children: [
                        {
                            label: 'Mesut K...',
                            className: 'bg-teal-500 text-white',
                            style: { borderRadius: '12px' }
                        },
                        {
                            label: 'Rahman K...',
                            className: 'bg-teal-500 text-white',
                            style: { borderRadius: '12px' }
                        },
                        {
                            label: 'Orhan K...',
                            className: 'bg-teal-500 text-white',
                            style: { borderRadius: '12px' }
                        },
                        {
                            label: 'PERSONEL',
                            className: 'bg-teal-500 text-white',
                            style: { borderRadius: '12px' }
                        }
                    ]
                },

            ]
        }
    ]);

    const nodeTemplate = (node) => {
        if (node.type === 'person') {
            return (
                <div className="flex flex-column">
                    <div className="flex flex-column align-items-center">
                        <img alt={node.data.name} src={node.data.image} className="mb-3 w-3rem h-3rem" />
                        <span className="font-bold mb-2">{node.data.name}</span>
                        <span>{node.data.title}</span>
                    </div>
                </div>
            );
        }

        return node.label;
    };

    const header = (
        <div className="flex align-items-center justify-content-start gap-2">
            <Button label="Personel Ekle" raised icon="pi pi-user" tooltip="Personel Ekle" tooltipOptions={{ position: 'bottom', mouseTrack: true, mouseTrackTop: 15 }}/>
        </div>
    );

    return (
        <>
        {pageLoading && <ProgressSpinner style={{width: '50px', height: '50px', top: '15%', left: '50%', position: 'fixed'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />}
        <div className="card">
            <Card className="mb-4" title="Kantin Heyeti Giriş/Güncelleme"></Card>
        <Splitter>
            <SplitterPanel className="flex justify-content-center align-items-center p-5">
                <Card>
                    <OrganizationChart value={data} nodeTemplate={nodeTemplate} />
                </Card>
            </SplitterPanel>
            <SplitterPanel className="flex pt-5 justify-content-center ">
                <DataTable header={header} stripedRows paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} responsive showGridlines tableStyle={{  width: '55rem' }}>
                <Column field="rutbe" header="Rütbe"></Column>
                <Column field="isim" header="İsim/Soyisim"></Column>
                <Column field="gorev" header="Görevi"></Column>
            </DataTable>
            </SplitterPanel>
        </Splitter>
</div>
</>
    )
};

