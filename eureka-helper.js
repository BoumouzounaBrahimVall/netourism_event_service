import { Eureka } from 'eureka-js-client';
import {IP} from './config.js';

const eurekaHost = process.env.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE || '127.0.0.1';
const eurekaPort = 8761;
const hostName = process.env.HOSTNAME || 'localhost';
const ipAddr = IP;

export function registerWithEureka(appName, PORT) {
  const client = new Eureka({
    instance: {
      app: appName,
      //instanceId: appName,
      hostName: hostName,

      ipAddr: ipAddr,
      port: {
        '$': PORT,
        '@enabled': 'true',
      },
      vipAddress: appName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    // Retry 10 times for 3 minutes 20 seconds.
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 10,
      requestRetryDelay: 2000,
    },
  });

  client.logger.level('debug');

  client.start((error) => {
    console.log(error || 'user service registered');
  });

  function exitHandler(options, exitCode) {
    if (options.cleanup) {
      // Clean up logic if needed
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) {
      client.stop();
    }
  }

  client.on('deregistered', () => {

    console.log('after deregistered');    process.exit();
  });

  client.on('started', () => {
    console.log('eureka host  ' + eurekaHost);
  });

  process.on('SIGINT', exitHandler.bind(null, { exit: true }));
}
