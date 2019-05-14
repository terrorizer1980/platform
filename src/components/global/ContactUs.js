import React from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';

function ContactUs() {
  return (
    <ListGroup className="contact-us-group">
      <h1>Contact Us</h1>
      <ListGroupItem>
        <i className="fab fa-app-store-ios fa-2x" />
        <a className="contact-us-div" href="https://goo.gl/forms/GEVXRc2QSLVuOnMb2" target="_blank" rel="noopener noreferrer">Submit DApp</a>
      </ListGroupItem>
      <ListGroupItem>
        <i className="fab fa-twitter fa-2x" />
        <a className="contact-us-div" href="https://twitter.com/TrustWalletApp" target="_blank" rel="noopener noreferrer">Twitter</a>
      </ListGroupItem>
      <ListGroupItem>
        <i className="fab fa-facebook fa-2x" />
        <a className="contact-us-div" href="https://www.facebook.com/trustwalletapp/" target="_blank" rel="noopener noreferrer">Facebook</a>
      </ListGroupItem>
    </ListGroup>
  );
}

export default ContactUs;
