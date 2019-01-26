import { TestBed } from '@angular/core/testing';
import { DocumentService } from './document.service';
import { DomRefService } from './dom.service';
import { DomRefServiceFake } from '../test/fake/dom-fake.service';
import { ElementRef } from '@angular/core';
import { FakeElementRef } from '../test/fake/dom-elements-fake.class';

describe('DocumentService', () => {
    let documentService: DocumentService;
    let domRefService: DomRefServiceFake;
    const getFakeDocument = (compatMode: string = undefined) => {
        return {
            compatMode,
            documentElement: {
                scrollTop: 10,
                scrollLeft: 30
            },
            body: { scrollTop: 5, scrollLeft: 5 },
            elementsFromPoint: jasmine.createSpy('elementsFromPoint')
        };
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocumentService, { provide: DomRefService, useClass: DomRefServiceFake }]
        });
    });

    beforeEach(() => {
        domRefService = TestBed.get(DomRefService);
    });

    describe('constructor', () => {
        it('should set the initial height', () => {
            domRefService.getNativeDocument.and.returnValue({
                documentElement: {
                    scrollHeight: 19,
                    offsetHeight: 5,
                    clientHeight: 50
                },
                body: {
                    scrollHeight: 11,
                    offsetHeight: 12,
                    clientHeight: 3
                }
            });

            documentService = TestBed.get(DocumentService);

            expect(documentService.getDocumentHeight()).toBe(50);
        });
    });
    describe('after service initialization', () => {
        beforeEach(() => {
            documentService = TestBed.get(DocumentService);
        });

        describe('getElementFixedTop', () => {
            beforeEach(() => {
                spyOn(documentService, 'setDocumentHeight');
            });
            it('should return the relative top position', () => {
                let elementRef: ElementRef = {
                    nativeElement: {
                        getBoundingClientRect: () => {
                            return { top: 30 };
                        }
                    }
                };
                let top = documentService.getElementFixedTop(elementRef);

                expect(top).toBe(30);
            });
        });

        describe('getElementFixedLeft', () => {
            it('should return the position from left for a fixed element', () => {
                const elementRef: ElementRef = {
                    nativeElement: {
                        getBoundingClientRect: () => {
                            return { left: 123 };
                        }
                    }
                };
                const left = documentService.getElementFixedLeft(elementRef);
                expect(left).toBe(123);
            });
        });

        describe('getElementAbsoluteTop', () => {
            describe('when pageXOffset is null', () => {
                beforeEach(() => {
                    domRefService.getNativeWindow.and.returnValue({ pageXOffset: null });
                });

                it('should return the absolute top position (documentElement scroll) for CSS1Compat browser', () => {
                    const fakeDocument = getFakeDocument('CSS1Compat');
                    domRefService.getNativeDocument.and.returnValue(fakeDocument);
                    const elementRef: ElementRef = {
                        nativeElement: {
                            getBoundingClientRect: () => {
                                return { top: 176 };
                            }
                        }
                    };

                    const top = documentService.getElementAbsoluteTop(elementRef);

                    expect(top).toBe(186);
                });

                it('should return the absolute top position (body scroll) for BackCompat browser', () => {
                    const fakeDocument = getFakeDocument('BackCompat');
                    domRefService.getNativeDocument.and.returnValue(fakeDocument);
                    const elementRef: ElementRef = {
                        nativeElement: {
                            getBoundingClientRect: () => {
                                return { top: 123 };
                            }
                        }
                    };
                    const top = documentService.getElementAbsoluteTop(elementRef);
                    expect(top).toBe(128);
                });

                it('should return the absolute top position (body scroll) if no compat mode is defined', () => {
                    const fakeDocument = getFakeDocument(undefined);
                    domRefService.getNativeDocument.and.returnValue(fakeDocument);
                    const elementRef: ElementRef = {
                        nativeElement: {
                            getBoundingClientRect: () => {
                                return { top: 123 };
                            }
                        }
                    };
                    const top = documentService.getElementAbsoluteTop(elementRef);
                    expect(top).toBe(128);
                });
            });
        });
        describe('when pageXOffset is NOT null', () => {
            beforeEach(() => {
                domRefService.getNativeWindow.and.returnValue({ pageXOffset: 5, pageYOffset: 15 });
            });

            it('should return the getBoundingClientRect.top + pageYOffset for CSS1Compat browser', () => {
                const fakeDocument = getFakeDocument('CSS1Compat');
                domRefService.getNativeDocument.and.returnValue(fakeDocument);
                const elementRef: ElementRef = {
                    nativeElement: {
                        getBoundingClientRect: () => {
                            return { top: 15 };
                        }
                    }
                };

                const top = documentService.getElementAbsoluteTop(elementRef);

                expect(top).toBe(30);
            });

            it('should return the getBoundingClientRect.top +  pageYOffset for BackCompat browser', () => {
                const fakeDocument = getFakeDocument('BackCompat');
                domRefService.getNativeDocument.and.returnValue(fakeDocument);
                const elementRef: ElementRef = {
                    nativeElement: {
                        getBoundingClientRect: () => {
                            return { top: 50 };
                        }
                    }
                };
                const top = documentService.getElementAbsoluteTop(elementRef);
                expect(top).toBe(65);
            });
        });

        describe('getElementAbsoluteLeft', () => {
            describe('when pageXOffset is null', () => {
                beforeEach(() => {
                    domRefService.getNativeWindow.and.returnValue({ pageXOffset: null });
                });

                it('should return the absolute left position (documentElement scroll left + boundingClientLeft) for CSS1Compat browser', () => {
                    const fakeDocument = getFakeDocument('CSS1Compat');
                    domRefService.getNativeDocument.and.returnValue(fakeDocument);
                    const elementRef: ElementRef = {
                        nativeElement: {
                            getBoundingClientRect: () => {
                                return { left: 20 };
                            }
                        }
                    };

                    const left = documentService.getElementAbsoluteLeft(elementRef);

                    expect(left).toBe(50);
                });

                it('should return the absolute left position (body scroll left + boundingClientLeft) for BackCompat browser', () => {
                    const fakeDocument = getFakeDocument('BackCompat');
                    domRefService.getNativeDocument.and.returnValue(fakeDocument);
                    const elementRef: ElementRef = {
                        nativeElement: {
                            getBoundingClientRect: () => {
                                return { left: 20 };
                            }
                        }
                    };
                    const left = documentService.getElementAbsoluteLeft(elementRef);
                    expect(left).toBe(25);
                });

                it('should return the absolute top position ((body scroll left + boundingClientLeft) if no compat mode is defined', () => {
                    const fakeDocument = getFakeDocument(undefined);
                    domRefService.getNativeDocument.and.returnValue(fakeDocument);
                    const elementRef: ElementRef = {
                        nativeElement: {
                            getBoundingClientRect: () => {
                                return { left: 20 };
                            }
                        }
                    };
                    const left = documentService.getElementAbsoluteLeft(elementRef);
                    expect(left).toBe(25);
                });
            });
        });
        describe('when pageXOffset is NOT null', () => {
            beforeEach(() => {
                domRefService.getNativeWindow.and.returnValue({ pageXOffset: 3, pageYOffset: 15 });
            });

            it('should return getBoundingClientRect.left + pageXOffset for CSS1Compat browser', () => {
                const fakeDocument = getFakeDocument('CSS1Compat');
                domRefService.getNativeDocument.and.returnValue(fakeDocument);
                const elementRef: ElementRef = {
                    nativeElement: {
                        getBoundingClientRect: () => {
                            return { left: 15 };
                        }
                    }
                };

                const left = documentService.getElementAbsoluteLeft(elementRef);

                expect(left).toBe(18);
            });

            it('should return getBoundingClientRect.left + pageXOffset for BackCompat browser', () => {
                const fakeDocument = getFakeDocument('BackCompat');
                domRefService.getNativeDocument.and.returnValue(fakeDocument);
                const elementRef: ElementRef = {
                    nativeElement: {
                        getBoundingClientRect: () => {
                            return { left: 50 };
                        }
                    }
                };
                const left = documentService.getElementAbsoluteLeft(elementRef);
                expect(left).toBe(53);
            });
        });

        describe('setDocumentHeight', () => {
            it(`should set the value of documentElement.scrollHeight`, () => {
                domRefService.getNativeDocument.and.returnValue({
                    documentElement: {
                        scrollHeight: 19,
                        offsetHeight: 5,
                        clientHeight: 1
                    },
                    body: {
                        scrollHeight: 11,
                        offsetHeight: 12,
                        clientHeight: 3
                    }
                });
                documentService.setDocumentHeight();

                expect(documentService.getDocumentHeight()).toBe(19);
            });
        });
        describe('setDocumentHeight', () => {
            it(`should set the value of documentElement.offsetHeight`, () => {
                domRefService.getNativeDocument.and.returnValue({
                    documentElement: {
                        scrollHeight: 19,
                        offsetHeight: 20,
                        clientHeight: 1
                    },
                    body: {
                        scrollHeight: 11,
                        offsetHeight: 12,
                        clientHeight: 3
                    }
                });

                documentService.setDocumentHeight();

                expect(documentService.getDocumentHeight()).toBe(20);
            });
        });
        describe('setDocumentHeight', () => {
            it(`should set the value of documentElement.clientHeight`, () => {
                domRefService.getNativeDocument.and.returnValue({
                    documentElement: {
                        scrollHeight: 19,
                        offsetHeight: 5,
                        clientHeight: 21
                    },
                    body: {
                        scrollHeight: 11,
                        offsetHeight: 12,
                        clientHeight: 3
                    }
                });

                documentService.setDocumentHeight();

                expect(documentService.getDocumentHeight()).toBe(21);
            });
        });
        describe('setDocumentHeight', () => {
            it(`should set the value of documentElement.body.scrollHeight`, () => {
                domRefService.getNativeDocument.and.returnValue({
                    documentElement: {
                        scrollHeight: 19,
                        offsetHeight: 5,
                        clientHeight: 1
                    },
                    body: {
                        scrollHeight: 22,
                        offsetHeight: 12,
                        clientHeight: 3
                    }
                });

                documentService.setDocumentHeight();

                expect(documentService.getDocumentHeight()).toBe(22);
            });
        });
        describe('setDocumentHeight', () => {
            it(`should set the value of documentElement.body.offsetHeight`, () => {
                domRefService.getNativeDocument.and.returnValue({
                    documentElement: {
                        scrollHeight: 19,
                        offsetHeight: 5,
                        clientHeight: 1
                    },
                    body: {
                        scrollHeight: 11,
                        offsetHeight: 23,
                        clientHeight: 3
                    }
                });

                documentService.setDocumentHeight();

                expect(documentService.getDocumentHeight()).toBe(23);
            });
        });
        describe('setDocumentHeight', () => {
            it(`should set the value of documentElement.body.clientHeight`, () => {
                domRefService.getNativeDocument.and.returnValue({
                    documentElement: {
                        scrollHeight: 19,
                        offsetHeight: 5,
                        clientHeight: 1
                    },
                    body: {
                        scrollHeight: 11,
                        offsetHeight: 12,
                        clientHeight: 24
                    }
                });

                documentService.setDocumentHeight();

                expect(documentService.getDocumentHeight()).toBe(24);
            });
        });

        describe('getFirstScrollableParent', () => {
            beforeEach(() => {
                domRefService.getNativeDocument.and.returnValue({ body: { theBody: 2 } });
                domRefService.getNativeWindow.and.returnValue({
                    getComputedStyle: (node, val) => {
                        return {
                            getPropertyValue: prop => {
                                return node.style[prop];
                            }
                        };
                    }
                });
            });
            it('should return the first node in the ancestor tree that has overflow set to one of auto|scroll|overlay', () => {
                const element = new FakeElementRef();
                element.nativeElement = {
                    style: { overflow: 'auto' }
                };
                const node = documentService.getFirstScrollableParent(element.nativeElement);
                expect(node).toBe(element.nativeElement);
            });
            it('should return the parent if the parent is the first scrollable', () => {
                const element = new FakeElementRef();
                element.nativeElement = {
                    style: { height: '12px' },
                    parentNode: { style: { overflow: 'scroll' } }
                };
                const node = documentService.getFirstScrollableParent(element.nativeElement);
                expect(node).toBe(element.nativeElement.parentNode);
            });
            it('should return the 2nd parent if the 2nd parent is the first scrollable', () => {
                const element = new FakeElementRef();
                element.nativeElement = {
                    style: { height: '12px' },
                    parentNode: {
                        style: { width: '20px' },
                        parentNode: { style: { overflow: 'auto' } }
                    }
                };
                const node = documentService.getFirstScrollableParent(element.nativeElement);
                expect(node).toBe(element.nativeElement.parentNode.parentNode);
            });
            it('should return the body if none of the', () => {
                const element = new FakeElementRef();
                element.nativeElement = {
                    style: { height: '12px' },
                    parentNode: {
                        style: { width: '20px' },
                        parentNode: { style: { display: 'flex' } }
                    }
                };
                const node = documentService.getFirstScrollableParent(element.nativeElement);
                expect(node).toEqual(jasmine.objectContaining({ theBody: 2 }));
            });
        });

        describe('isElementBeyondOthers', () => {
            const fakeDoc = getFakeDocument();
            const element = new FakeElementRef();
            element.nativeElement.title = 'div1';

            it('should return true if the element when elementsFromPoint does NOT return the element as first (top and bottom of the elment)', () => {
                fakeDoc.elementsFromPoint.and.returnValue(['html', element.nativeElement, 'div2', 'div3']);
                domRefService.getNativeDocument.and.returnValue(fakeDoc);

                const result = documentService.isElementBeyondOthers(element, false);

                expect(result).toBe(true);
            });

            it('should return true if the element when elementsFromPoint does NOT return the element as first (top of the element)', () => {
                fakeDoc.elementsFromPoint.and.returnValues(
                    ['html', element.nativeElement, 'div2', 'div3'],
                    [element.nativeElement, 'div2', 'div3']
                );
                domRefService.getNativeDocument.and.returnValue(fakeDoc);

                const result = documentService.isElementBeyondOthers(element, false);

                expect(result).toBe(true);
            });

            it('should return true if the element when elementsFromPoint does NOT return the element as first (bottom of the element)', () => {
                fakeDoc.elementsFromPoint.and.returnValues(
                    [element.nativeElement, 'div2', 'div3'],
                    ['html', element.nativeElement, 'div2', 'div3']
                );
                domRefService.getNativeDocument.and.returnValue(fakeDoc);

                const result = documentService.isElementBeyondOthers(element, false);

                expect(result).toBe(true);
            });

            it('should return true if the element when elementsFromPoint does NOT return the element as first', () => {
                fakeDoc.elementsFromPoint.and.returnValue(['html', element.nativeElement, 'div2', 'div3']);
                domRefService.getNativeDocument.and.returnValue(fakeDoc);

                const result = documentService.isElementBeyondOthers(element, false);

                expect(result).toBe(true);
            });

            it('should return false if the the element when elementsFromPoint returns []', () => {
                fakeDoc.elementsFromPoint.and.returnValue([]);
                domRefService.getNativeDocument.and.returnValue(fakeDoc);

                const result = documentService.isElementBeyondOthers(element, false);

                expect(result).toBe(true);
            });

            it('should return false if the element when elementsFromPoint returns the element as first', () => {
                fakeDoc.elementsFromPoint.and.returnValue([element.nativeElement, 'div2', 'div3']);
                domRefService.getNativeDocument.and.returnValue(fakeDoc);

                const result = documentService.isElementBeyondOthers(element, false);

                expect(result).toBe(false);
            });
        });
    });
});
