import {router, useForm} from "@inertiajs/react";
import TestForm from "@/Components/TestForm.jsx";
import {post} from "axios";
import {useState} from "react";

export default function TestPage({auth}) {

    // const {data, setData, post, processing, errors} = useForm({
    //     time: '',
    //     type: 'pvp',
    // });



    // const enterGameSubmit = (e) => {
    //     e.preventDefault();
    //     post(`/${data['gameId']}/games`);
    // }

    function newGame() {

        router.post('/games', {
                time: 10,
                type: 'pvb',
            },
            {
                onError: () => {
                    alert('error');
                },
            }
        );
    }



return (
        <div>
            <TestForm title={'Nuova partita'}>
                <button onClick={newGame}>New game</button>
            </TestForm>

            <TestForm title={'Entra in partita'}>
                <form>
                    <input placeholder={'codice'}/>
                    <button>Entra</button>
                </form>
            </TestForm>

            <TestForm title={'Prossima mossa'}>
                <input placeholder={'Mossa (e6, Bb4)'}/>
                <button>Invia</button>
            </TestForm>
        </div>
    );


}
