/* eslint-disable no-unused-vars */
'use strict';
const handlers = require('../../../UIAPIServer/handlers');
const { CertificatesModel, Hub } = require('@internal/model');
const cas = require('../../resources/cas.json');


describe('create dfsp csr and upload to mcm', () => {
    test('when creating a csr it calls one time to certificates model csr creation and upload csr', async () => {

        const csrParameters = {
            privateKeyAlgorithm: 'rsa',
            privateKeyLength: 4096,
            parameters: 'mocked'
        };

        const createdCsrMock = { key: 'mocked', csr: 'mocked'};
        
        const context =  {
            'state': {
                'conf': {
                    envId: '1',
                    dfspId: 'pm4mltest',
                    privateKeyAlgorithm: csrParameters.privateKeyAlgorithm,
                    privateKeyLength : csrParameters.privateKeyLength,
                    dfspCsrParameters: csrParameters.parameters
                },
                logger: {
                    push: (obj) => {
                        return { log : (msg) => {
                            // this is too verbose
                            // console.log(obj, msg);
                        }};
                    }
                }
            },
            params: { 'envId': '1' }
        };

        const createClientCSRSpy = jest.spyOn(CertificatesModel.prototype, 'createClientCSR')
            .mockImplementation(() => { return createdCsrMock; });

        const uploadClientCSRSpy = jest.spyOn(CertificatesModel.prototype, 'uploadClientCSR')
            .mockImplementation(() => { return {ctx: {body: 1}};});

        const signInboundEnrollmentSpy = jest.spyOn(CertificatesModel.prototype, 'signInboundEnrollment')
            .mockImplementation(() => { return {ctx: {body: 1}};});

        const getHubCASSpy = jest.spyOn(Hub.prototype, 'getHubCAS')
            .mockImplementation(() => { return cas; } );
            

        await handlers['/environments/{envId}/dfsp/clientcerts/csr'].post(context);

        expect(createClientCSRSpy).toHaveBeenCalledTimes(1);
        expect(uploadClientCSRSpy).toHaveBeenCalledTimes(1);
        expect(signInboundEnrollmentSpy).toHaveBeenCalledTimes(1);
        expect(getHubCASSpy).toHaveBeenCalledTimes(1);

        expect(createClientCSRSpy.mock.calls[0][0]).toStrictEqual(csrParameters);

        expect(uploadClientCSRSpy.mock.calls[0][0]).toStrictEqual(createdCsrMock.csr);
    });
});
