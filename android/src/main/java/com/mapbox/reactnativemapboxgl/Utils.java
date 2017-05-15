package com.mapbox.reactnativemapboxgl;

import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Set;

import javax.annotation.Nullable;

public class Utils {
    public static <E> Collection<E> difference(final Set<E> set1, final Set<E> set2) {
        return new AbstractSet<E>() {
            @Override
            public Iterator<E> iterator() {
                final Iterator<E> iterator = set1.iterator();

                return new AbstractIterator<E>() {
                    @Override
                    protected E computeNext() {
                        while (iterator.hasNext()) {
                            E ele = iterator.next();
                            if (!set2.contains(ele)) {
                                return ele;
                            }
                        }

                        return endOfData();
                    }
                };
            }

            @Override
            public int size() {
                throw new RuntimeException("stub");
            }
        };
    }

    abstract static class AbstractIterator<T> implements Iterator<T> {
        private State state = State.NOT_READY;

        protected AbstractIterator() {}

        private enum State {
            READY,
            NOT_READY,
            DONE,
            FAILED,
        }

        private T next;

        protected abstract T computeNext();

        @Nullable
        protected final T endOfData() {
            state = State.DONE;
            return null;
        }

        @Override
        public final boolean hasNext() {
            switch (state) {
                case READY:
                    return true;
                case DONE:
                    return false;
                default:
            }
            return tryToComputeNext();
        }

        private boolean tryToComputeNext() {
            state = State.FAILED; // temporary pessimism
            next = computeNext();
            if (state != State.DONE) {
                state = State.READY;
                return true;
            }
            return false;
        }

        @Override
        public final T next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            state = State.NOT_READY;
            T result = next;
            next = null;
            return result;
        }

        @Override
        public final void remove() {
            throw new UnsupportedOperationException();
        }
    }
}
