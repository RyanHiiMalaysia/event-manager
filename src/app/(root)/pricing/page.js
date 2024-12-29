"use client";

import React from 'react';
import { Card, CardBody, CardHeader, Image } from '@nextui-org/react';

const PricingPage = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card>
                <CardHeader>
                    <h2 style={{ fontSize: '32px' }}>Pricing</h2>
                </CardHeader>
                <CardBody>
                    <p style={{ fontSize: '18px' }}>
                        Get lifetime access to our Event Manager for a one-time purchase of RM5.
                    </p>
                    <Image
                        alt="TNG eWallet QR"
                        src="tng.jpg"
                        width={300}
                    />
                </CardBody>
            </Card>
        </div>
    );
};

export default PricingPage;