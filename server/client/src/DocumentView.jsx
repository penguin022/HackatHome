import React, { useEffect, useState } from 'react';
import { withRouter, useParams } from 'react-router'
import styled from 'styled-components'
import Loader from './Loader';
import TextAnnotater from './TextAnnotater'
import axios from 'axios'
import promiseRetry from 'promise-retry'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const StyledDocumentView = styled.div`
.video {
    justify-content: left;
    width: 100%;
}

`

export default withRouter((props) => {
    const { doc } = useParams();
    const [document, setDocument] = useState(null)
    const [err, setErr] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let [text, video] = await Promise.all([axios.get("/get_transcript/" + doc), axios.get("/get_video/" + doc)]);
                setDocument({ id: doc, text: text.data, video: `data:application/video;base64,${video.data}`});
            }
            catch(ex) {
                setErr(true);
            }
        }
        promiseRetry(function (retry, number) {
            console.log(number)
            return fetchData().catch(retry);
        }, {
            factor: 1.3,
            minTimeout: 100
        })
    }, [doc])

    return <StyledDocumentView>
        {err ? <>Not found</> : !document ? <Loader /> : 
            <Container>
            <Row>
              <Col><video className="video" controls>
             <source type="video/mp4" src={document.video} />
             </video></Col>
              <Col><TextAnnotater document={document}/></Col>
            </Row></Container>}
    </StyledDocumentView>
})