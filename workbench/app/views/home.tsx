// IMPORTS
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Grid, Row, Col, SingleColumnRow } from './../../../source/components/layout/grid';
import { Heading } from './../../../source/components/text/heading';
import { Button } from './../../../source/components/interaction/button';
import { Text } from './../../../source/components/text/text';
import { Image } from './../../../source/components/display/image';

export class Home extends React.Component<{}, {}> {

  public render() {
    return (
      <Grid responsive="none" debugMode={true}>
        <Row fixed={true}>
          <Col padding="small" centerContent="both">
            <Heading elementType="h1" styleType="heading1">Armstrong Bench</Heading>
          </Col>
        </Row>
        <SingleColumnRow padding="medium">

          <Heading elementType="h1" styleType="heading1">Button</Heading>
          <Text margin={{ top: "none", bottom: "small" }}>Pretty self explanatory</Text>
          <Button text="Click me!"/>
          <Button text="Click me also!" condition="positive"/>
          <br/>
          <br/>
          <Heading elementType="h1" styleType="heading1">Text</Heading>
          <Text margin={{ top: "none", bottom: "small" }}>Also pretty self explanatory</Text>
          <Text margin={{ top: "none", bottom: "small" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.Nam vel bibendum est.Etiam dapibus metus ante, ac ultrices sem sollicitudin vel.Pellentesque rhoncus metus at metus viverra tempor.Morbi nunc augue, mollis quis faucibus ac, mattis luctus mauris.Praesent eu eros ut purus ullamcorper congue sit amet eu neque.Vestibulum maximus metus varius risus aliquet efficitur.Praesent placerat ipsum accumsan nulla commodo, eu volutpat enim feugiat.Nam aliquam a eros a scelerisque.
          </Text>
          <br/>
          <br/>
          <Heading elementType="h1" styleType="heading1">Image</Heading>
          <Text margin={{ top: "none", bottom: "small" }}>Again pretty self explanatory</Text>
          <Image height={128} width={128} margin={{right: "medium"}}/>
          <Image height={128} width={128} margin={{right: "medium"}} rounded={true}/>
          <Image height={128} width={128} margin={{right: "medium"}} rounded={true} sampleUser={true}/>
        </SingleColumnRow>

      </Grid>
    );
  }
}
