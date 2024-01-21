//@ts-nocheck
import React, { useState} from 'react';
import {CSSTransition, TransitionGroup} from "react-transition-group";
import Alert from "./Alert";
import {ModalManager} from "../../components/ModalManager";
import {useAddEvent} from "../../hooks/useAddEvent";

export type IAlertData = {
    type: "success" | "error" | "loader" | "warning" | "message",
    body?: string,
    timeout: number;
}

interface IAlerts {
    open(data: IAlertData);
    close(id: number);
    update(id: number, data: IAlertData);
}

declare global {
    interface Window {
        alerts: IAlerts;
    }
}

const AlertContainer = () => {
    const [alerts, setAlerts] = useState([]);

    class Alerts implements IAlerts {
        open(data: IAlertData) {
            const id = new Date().getTime();
            setAlerts(al => [...al, {...data, id}]);
            console.log(data, this)
            if (data.timeout !== 0) {
                setTimeout(() => {
                    this.close(id);
                }, data.timeout || 2000);
            }
            return id;
        }

        close(id: number) {
            console.log(id, this)
            setAlerts(al => al.filter(a => a.id !== id));
        }

        update(id: number, data: IAlertData) {
            console.log(data, id, this)
            setAlerts(alerts => {
                let newAlerts = [...alerts];
                for (let i = 0; i < newAlerts.length; i++) {
                    if (newAlerts[i].id === id) {
                        newAlerts[i] = {...newAlerts[i], ...data};
                        break;
                    }
                }
                return newAlerts;
            });
        }
    }

    window.alerts = new Alerts();
    console.log(alerts)
    return (
        <ModalManager style={{bg: 'bg-none'}}
                      name={'alert'}
                      defaultOpened={true}
                      closeConditions={[]}>
            <div className={'alerts-container'}>
                <TransitionGroup key={'alerts'} component={null}>
                    {
                        alerts.sort((a, b) => a.id - b.id)
                            .map((data) => <CSSTransition key={data.id} timeout={200} classNames={"alert"}>
                                <Alert data={data}></Alert>
                        </CSSTransition>
                        )
                    }
                </TransitionGroup>
            </div>
        </ModalManager>
    );
};

export default AlertContainer;